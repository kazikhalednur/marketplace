import json

from asgiref.sync import sync_to_async
from django.core.paginator import EmptyPage, Paginator
from drf_spectacular_websocket.decorators import extend_ws_schema

from accounts.models import WebSocketID
from utils.permissions import AllowAny
from utils.websocket import BaseAuthConsumer

from .models import Notification
from .serializers import (
    SendNotificationInputSerializer,
    SendNotificationOutputSerializer,
    SendNotificationSerializer,
)


class NotificationConsumer(BaseAuthConsumer):
    permission_classes = [AllowAny]  # Allow initial connection without auth

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.notification_group_name = None
        self.user = None
        self.websocket_id = None
        self.is_authenticated = False

    async def custom_connect(self):
        """Custom connect logic that runs after authentication is successful"""
        # Don't authenticate immediately - wait for auth message
        self.user = self.scope["user"]

        # Get notification_id from URL
        self.notification_id = self.scope["url_route"]["kwargs"].get("notification_id")
        if not self.notification_id:
            await self.handle_bad_request("Notification ID required")
            return

        # Accept connection but don't setup notification yet
        # Wait for authentication message
        await self.send_json(
            {
                "type": "connection_established",
                "message": "WebSocket connected. Send authentication message.",
                "requires_auth": True,
            }
        )

    async def disconnect(self, close_code):
        if self.notification_group_name is not None:
            await self.channel_layer.group_discard(
                self.notification_group_name, self.channel_name
            )

    @extend_ws_schema(
        type="receive",
        summary="Receive notification actions",
        description="Handle incoming WebSocket messages for notification actions",
        request=SendNotificationInputSerializer,
        responses=SendNotificationOutputSerializer(many=True),
    )
    async def receive_notification(self, text_data=None, bytes_data=None):
        if not text_data:
            await self.handle_bad_request("No data provided")
            return

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.handle_bad_request("Invalid JSON format")
            return

        # Validate required fields
        if not isinstance(data, dict):
            await self.handle_bad_request("Invalid message format")
            return

        message_type = data.get("type")
        if not message_type:
            await self.handle_bad_request("Message type is required")
            return

        # Handle authentication first
        if message_type == "auth":
            await self.handle_auth(data)
            return

        # Check if authenticated for other operations
        if not self.is_authenticated:
            await self.handle_unauthorized("Authentication required")
            return

        # Handle other message types
        if message_type == "ping":
            await self.send_success_response({"message": "pong"})
        elif message_type == "get_notifications":
            await self.handle_get_notifications(data)
        else:
            await self.handle_bad_request("Invalid message type")

    async def handle_auth(self, data):
        """Handle authentication message"""
        try:
            token = data.get("token")

            if not token:
                await self.handle_bad_request("Token is required")
                return

            # Remove 'Bearer ' prefix if present
            if token.startswith("Bearer "):
                token = token[7:]

            # Validate token and get user
            user = await self.validate_token(token)
            if not user:
                await self.handle_unauthorized("Invalid token")
                return

            # Update user in scope
            self.scope["user"] = user
            self.user = user

            # Setup notification access
            if not await self.setup_notification():
                await self.handle_not_found("Notification not found or access denied")
                return

            # Join notification group
            self.notification_group_name = f"notification_{self.notification_id}"
            await self.channel_layer.group_add(
                self.notification_group_name, self.channel_name
            )
            # Mark as authenticated
            self.is_authenticated = True
            # Send success response
            await self.send_success_response(
                {
                    "type": "auth_success",
                    "message": "Authentication successful",
                }
            )
            # Send initial notifications
            await self.send_paginated_notifications(user, page=1, page_size=10)

        except Exception:
            await self.handle_server_error("Authentication failed")

    @sync_to_async
    def validate_token(self, token):
        """Validate JWT token and return user"""
        try:
            from django.contrib.auth import get_user_model
            from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
            from rest_framework_simplejwt.tokens import AccessToken

            User = get_user_model()

            # Decode token
            access_token = AccessToken(token)
            user_id = access_token["user_id"]

            # Get user
            user = User.objects.get(id=user_id)
            return user

        except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
            return None
        except Exception:
            return None

    async def setup_notification(self):
        """Setup and validate notification access"""
        try:
            # Get websocket_id from database
            self.websocket_id = await self.get_websocket_id_by_notification_id(
                self.notification_id
            )

            if not self.websocket_id:
                return False

            # Check if user has access to this notification
            if not await self.check_notification_access():
                return False

            return True

        except Exception:
            return False

    @sync_to_async
    def get_websocket_id_by_notification_id(self, notification_id):
        """Get WebSocketID by notification_id"""
        try:
            return WebSocketID.objects.get(notication_id=notification_id)
        except WebSocketID.DoesNotExist:
            return None

    @sync_to_async
    def check_notification_access(self):
        """Check if user has access to the notification"""
        if not self.websocket_id or not self.user:
            return False

        # Check if the websocket_id belongs to the user
        if self.websocket_id.user == self.user:
            return True

        # Add additional access checks here if needed
        # For example, check if user is admin, or has specific permissions

        return False

    async def handle_get_notifications(self, data):
        """Handle get_notifications action with proper validation"""
        try:
            page = data.get("page", 1)
            page_size = data.get("page_size", 10)

            # Validate page and page_size
            if not isinstance(page, int) or page < 1:
                await self.handle_bad_request("Invalid page number")
                return

            if not isinstance(page_size, int) or page_size < 1 or page_size > 100:
                await self.handle_bad_request("Invalid page size (must be 1-100)")
                return

            await self.send_paginated_notifications(self.user, page, page_size)

        except Exception:
            await self.handle_server_error("Error retrieving notifications")

    @extend_ws_schema(
        type="send",
        summary="Send notification",
        description="Send a notification to the connected user",
        request=SendNotificationInputSerializer,
        responses=SendNotificationOutputSerializer(many=True),
    )
    async def send_notification(self, event):
        await self.send_json(event["message"])

    async def send_paginated_notifications(self, user, page, page_size):
        try:
            paginated_data = await self.get_paginated_notifications(
                user, page, page_size
            )
            serializer = SendNotificationSerializer(
                paginated_data["results"], many=True
            )

            await self.send_success_response(
                {
                    "message": "Request Successful",
                    "data": {
                        "count": paginated_data["count"],
                        "page": paginated_data["page"],
                        "page_size": paginated_data["page_size"],
                        "total_pages": paginated_data["total_pages"],
                        "results": serializer.data,
                    },
                }
            )
        except Exception:
            await self.handle_server_error("Error retrieving notifications")

    @sync_to_async
    def get_notification_room_name(self, user):
        return user.websocket.notication_id

    @sync_to_async
    def get_paginated_notifications(self, user, page, page_size):
        qs = Notification.objects.filter(user=user).order_by("-created_at")
        paginator = Paginator(qs, page_size)
        total = paginator.count

        try:
            current_page = paginator.page(page)
        except EmptyPage:
            current_page = paginator.page(paginator.num_pages)

        return {
            "count": total,
            "page": current_page.number,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "results": list(current_page.object_list),
        }

    receive = receive_notification
    chat_message = send_notification
