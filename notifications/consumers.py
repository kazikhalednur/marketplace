import json

from asgiref.sync import sync_to_async
from django.core.paginator import EmptyPage, Paginator
from drf_spectacular_websocket.decorators import extend_ws_schema

from accounts.models import WebSocketID
from utils.permissions import IsAuthenticated
from utils.websocket import BaseAuthConsumer

from .models import Notification
from .serializers import (
    SendNotificationInputSerializer,
    SendNotificationOutputSerializer,
    SendNotificationSerializer,
)


class NotificationConsumer(BaseAuthConsumer):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.notification_group_name = None
        self.user = None
        self.websocket_id = None

    async def custom_connect(self):
        """Custom connect logic that runs after authentication is successful"""
        self.user = self.scope["user"]

        # Get notification_id from URL
        self.notification_id = self.scope["url_route"]["kwargs"].get("notification_id")
        if not self.notification_id:
            await self.handle_bad_request("Notification ID required")
            return

        if not await self.setup_notification():
            await self.handle_bad_request("Notification not found")
            return

        self.notification_group_name = f"notification_{self.notification_id}"

        await self.channel_layer.group_add(
            self.notification_group_name, self.channel_name
        )

        await self.send_paginated_notifications(self.user, page=1, page_size=10)

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
            return WebSocketID.objects.get(notification_id=notification_id)
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

    async def disconnect(self, close_code):
        if self.notification_group_name is not None:
            await self.channel_layer.group_discard(
                self.notification_group_name, self.channel_name
            )

    @extend_ws_schema(
        type="receive",
        summary="Receive notification actions",
        description="Handle incoming WebSocket messages for notification actions",
        request=None,
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

        action = data.get("action")
        if not action:
            await self.handle_bad_request("Action is required")
            return

        # Security: Validate action types
        allowed_actions = ["ping", "get_notifications"]
        if action not in allowed_actions:
            await self.handle_bad_request("Invalid action")
            return

        try:
            if action == "ping":
                await self.send_success_response({"message": "pong"})

            elif action == "get_notifications":
                await self.handle_get_notifications(data)

        except Exception:
            await self.handle_server_error("Internal server error")

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
        return user.websocket.notification_id

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
