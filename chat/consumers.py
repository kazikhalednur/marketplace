import json

from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from drf_spectacular_websocket.decorators import extend_ws_schema
from rest_framework.serializers import (
    BooleanField,
    CharField,
    ChoiceField,
    IntegerField,
    ListField,
    Serializer,
)

from accounts.models import ClientProfile, FreelancerProfile
from utils.permissions import IsAuthenticated
from utils.websocket import BaseAuthConsumer

from .models import Conversation, Message


class MessageInputSerializer(Serializer):
    type = ChoiceField(choices=["message"], help_text="Message type")
    text = CharField(max_length=1000, help_text="Message text content")


class SeenListItemSerializer(Serializer):
    username = CharField(help_text="Username of the user who saw the message")
    seen_at = CharField(help_text="ISO timestamp when the user saw the message")


class MessageOutputSerializer(Serializer):
    id = IntegerField()
    text = CharField()
    sender_type = CharField(help_text="'freelancer' or 'client'")
    sender_name = CharField()
    timestamp = CharField()
    is_read = BooleanField()
    seen_list = ListField(
        child=SeenListItemSerializer(),
        help_text="List of users with timestamps who have seen this message",
    )


class MessageListSerializer(Serializer):
    type = ChoiceField(choices=["message"], help_text="Message type")
    data = ListField(
        child=MessageOutputSerializer(),
        help_text="List of messages with seen information",
    )


class TypingIndicatorInputSerializer(Serializer):
    type = ChoiceField(choices=["typing"], help_text="Message type")
    is_typing = BooleanField(help_text="Whether user is typing")


class TypingIndicatorOutputSerializer(Serializer):
    type = ChoiceField(choices=["typing_indicator"], help_text="Message type")
    is_typing = BooleanField(help_text="Whether user is typing")
    user_type = ChoiceField(choices=["freelancer", "client"], help_text="User type")
    user_name = CharField(help_text="User name")


class ReadReceiptSerializer(Serializer):
    message_id = IntegerField(help_text="Message ID to mark as read")
    conversation_id = CharField(help_text="Conversation identifier")


class ConversationInfoSerializer(Serializer):
    conversation_id = CharField()
    status = CharField()
    user_type = CharField()
    user_name = CharField()


class ChatConsumer(BaseAuthConsumer):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.user_profile = None
        self.profile_type = None  # 'freelancer' or 'client'
        self.conversation = None
        self.conversation_group_name = None

    async def custom_connect(self):
        """Handle WebSocket connection with authentication and conversation setup"""
        # Get user from scope
        self.user = self.scope.get("user")

        # Get conversation_id from URL
        self.conversation_id = self.scope["url_route"]["kwargs"].get("room_name")
        if not self.conversation_id:
            await self.handle_bad_request("Conversation ID required")
            return

        # Setup user profile and conversation
        if not await self.setup_user_profile():
            await self.handle_not_found("User profile not found")
            return

        if not await self.setup_conversation():
            await self.handle_not_found("Conversation not found")
            return

        # Join conversation group
        self.conversation_group_name = f"chat_{self.conversation_id}"
        await self.channel_layer.group_add(
            self.conversation_group_name, self.channel_name
        )

        # Send conversation info and recent messages
        await self.send_conversation_info()
        await self.send_recent_messages()

        # Mark existing messages as read
        await self.mark_messages_as_read()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            if self.conversation_group_name:
                await self.channel_layer.group_discard(
                    self.conversation_group_name, self.channel_name
                )

            # Update user status if needed
            await self.update_user_status(False)
        except Exception as e:
            print(f"Error during disconnect: {e}")

    @database_sync_to_async
    def setup_user_profile(self) -> bool:
        """Setup user profile (freelancer or client)"""
        try:
            # Try to get freelancer profile
            freelancer_profile = FreelancerProfile.objects.filter(
                freelancer=self.user
            ).first()
            if freelancer_profile:
                self.username = freelancer_profile.freelancer.username
                self.user_profile = freelancer_profile
                self.profile_type = "freelancer"
                return True

            # Try to get client profile
            client_profile = ClientProfile.objects.filter(client=self.user).first()
            if client_profile:
                self.username = client_profile.client.username
                self.user_profile = client_profile
                self.profile_type = "client"
                return True

            return False
        except Exception:
            return False

    @database_sync_to_async
    def setup_conversation(self) -> bool:
        """Setup and validate conversation access"""
        try:
            self.conversation = Conversation.objects.get(
                conversation_id=self.conversation_id, status=Conversation.Status.ACTIVE
            )

            if self.conversation.contract.freelancer_profile.id == self.user_profile.id:
                return True

            if self.conversation.contract.client_profile.id == self.user_profile.id:
                return True

            return False
        except ObjectDoesNotExist:
            return False

    @database_sync_to_async
    def get_message_seen_list(self, message):
        """Get list of users who have seen a specific message"""
        return message.get_seen_list()

    @database_sync_to_async
    def get_message_seen_list_by_id(self, message_id):
        """Get list of users who have seen a specific message by ID"""
        try:
            message = Message.objects.get(id=message_id, conversation=self.conversation)
            return message.get_seen_list()
        except ObjectDoesNotExist:
            return []

    @database_sync_to_async
    def get_recent_messages(self, limit=50):
        """Get recent messages for the conversation"""
        messages = Message.objects.filter(
            conversation=self.conversation
        ).select_related("freelancer_profile__freelancer", "client_profile__client")[
            :limit
        ]

        return list(reversed(messages))  # Return in chronological order

    @database_sync_to_async
    def save_message(self, text: str) -> Message:
        """Save a new message to the database"""
        message_data = {
            "conversation": self.conversation,
            "text": text,
        }

        if self.profile_type == "freelancer":
            message_data["freelancer_profile"] = self.user_profile
        else:
            message_data["client_profile"] = self.user_profile

        message = Message.objects.create(**message_data)

        # Update conversation timestamp
        self.conversation.save()  # This will update the timestamp

        return message

    @database_sync_to_async
    def mark_messages_as_read(self):
        """Mark all messages in conversation as read by current user"""
        messages = Message.objects.filter(
            conversation=self.conversation, is_read=False
        ).exclude(**{f"{self.profile_type}_profile": self.user_profile})

        for message in messages:
            message.is_read = True
            message.save()

            # Mark as seen based on user type
            if self.profile_type == "freelancer":
                message.mark_as_seen_by_freelancer()
            else:
                message.mark_as_seen_by_client()

    @database_sync_to_async
    def mark_specific_message_as_read(self, message_id: int):
        """Mark a specific message as read"""
        try:
            message = Message.objects.get(id=message_id, conversation=self.conversation)
            message.is_read = True
            message.save()

            # Mark as seen based on user type
            if self.profile_type == "freelancer":
                message.mark_as_seen_by_freelancer()
            else:
                message.mark_as_seen_by_client()
            return True
        except ObjectDoesNotExist:
            return False

    async def send_conversation_info(self):
        """Send conversation information to the client"""
        conversation_info = {
            "type": "conversation_info",
            "conversation_id": self.conversation_id,
            "status": self.conversation.status,
            "user_type": self.profile_type,
            "user_name": self.username,
        }
        await self.send_success_response(conversation_info)

    async def send_recent_messages(self):
        """Send recent messages to the client"""
        try:
            messages = await self.get_recent_messages()

            message_data = {
                "type": "message",
                "data": [],
            }

            for message in messages:
                seen_list = await self.get_message_seen_list(message)
                message_data["data"].append(
                    {
                        "id": message.id,
                        "text": message.text,
                        "timestamp": message.timestamp.isoformat(),
                        "is_read": message.is_read,
                        "sender_type": (
                            "freelancer" if message.freelancer_profile else "client"
                        ),
                        "sender_name": (
                            message.freelancer_profile.freelancer.username
                            if message.freelancer_profile
                            else message.client_profile.client.username
                        ),
                        "seen_list": seen_list,
                    }
                )
            await self.send_success_response(message_data)
        except Exception as e:
            # Log the error and send empty message list
            print(f"Error getting recent messages: {e}")
            await self.send_success_response(
                {
                    "type": "message",
                    "data": [],
                }
            )

    @extend_ws_schema(
        type="receive",
        summary="Receive chat messages",
        description="Handle incoming WebSocket messages for chat actions",
        request=MessageInputSerializer,
        responses=MessageOutputSerializer,
    )
    async def receive_chat(self, text_data):
        """Handle incoming WebSocket messages"""
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

        message_type = data.get("type", "message")
        if not message_type:
            await self.handle_bad_request("Message type is required")
            return

        # Security: Validate message types
        allowed_actions = ["message", "typing", "read_receipt"]
        if message_type not in allowed_actions:
            await self.handle_bad_request("Invalid message type")
            return

        try:
            if message_type == "message":
                await self.handle_message(data)
            elif message_type == "typing":
                await self.handle_typing(data)
            elif message_type == "read_receipt":
                await self.handle_read_receipt(data)

        except Exception:
            await self.handle_server_error("Internal server error")

    async def handle_message(self, data):
        """Handle text message"""
        text = data.get("text", "").strip()
        if not text:
            await self.handle_bad_request("Message text is required")
            return

        if len(text) > 1000:
            await self.handle_payload_too_large(
                "Message too long (max 1000 characters)"
            )
            return

        # Save message to database
        message = await self.save_message(text)

        # Get all recent messages after saving the new message
        messages = await self.get_recent_messages()

        # Prepare message data with all recent messages
        message_data = {
            "type": "chat_message",  # Changed from "message" to "chat_message"
            "data": [],
        }

        for message in messages:
            seen_list = await self.get_message_seen_list(message)
            message_data["data"].append(
                {
                    "id": message.id,
                    "text": message.text,
                    "timestamp": message.timestamp.isoformat(),
                    "is_read": message.is_read,
                    "sender_type": (
                        "freelancer" if message.freelancer_profile else "client"
                    ),
                    "sender_name": (
                        message.freelancer_profile.freelancer.username
                        if message.freelancer_profile
                        else message.client_profile.client.username
                    ),
                    "seen_list": seen_list,
                }
            )

        # Broadcast to conversation group
        await self.channel_layer.group_send(self.conversation_group_name, message_data)

    async def handle_typing(self, data):
        """Handle typing indicator"""
        is_typing = data.get("is_typing", False)

        typing_data = {
            "type": "typing_indicator",  # This should match the method name
            "user_type": self.profile_type,
            "user_name": self.username,
            "is_typing": is_typing,
        }

        # Broadcast typing indicator to conversation group
        await self.channel_layer.group_send(self.conversation_group_name, typing_data)

    async def handle_read_receipt(self, data):
        """Handle read receipt"""
        message_id = data.get("message_id")
        if not message_id:
            await self.handle_bad_request("Message ID required for read receipt")
            return

        # Mark message as read
        success = await self.mark_specific_message_as_read(message_id)
        if success:
            # Get all recent messages after marking as read
            messages = await self.get_recent_messages()

            # Prepare message data with all recent messages
            message_data = {
                "type": "chat_message",
                "data": [],
            }

            for message in messages:
                seen_list = await self.get_message_seen_list(message)
                message_data["data"].append(
                    {
                        "id": message.id,
                        "text": message.text,
                        "timestamp": message.timestamp.isoformat(),
                        "is_read": message.is_read,
                        "sender_type": (
                            "freelancer" if message.freelancer_profile else "client"
                        ),
                        "sender_name": (
                            message.freelancer_profile.freelancer.username
                            if message.freelancer_profile
                            else message.client_profile.client.username
                        ),
                        "seen_list": seen_list,
                    }
                )

            # Broadcast updated message list to conversation group
            await self.channel_layer.group_send(
                self.conversation_group_name, message_data
            )
        else:
            await self.handle_not_found("Message not found or access denied")

    @extend_ws_schema(
        type="send",
        summary="Send chat message",
        description="Send a chat message to the conversation",
        request=MessageInputSerializer,
        responses=MessageListSerializer,
    )
    async def send_message(self, event):
        """Handle chat message events from channel layer"""
        await self.send_success_response(
            {
                "type": "message",
                "data": event["data"],
            }
        )

    @extend_ws_schema(
        type="send",
        summary="Send typing indicator",
        description="Send typing indicator to conversation participants",
        request=TypingIndicatorInputSerializer,
        responses=TypingIndicatorOutputSerializer,
    )
    async def typing_indicator(self, event):
        """Handle typing indicator events"""
        await self.send_success_response(
            {
                "type": "typing_indicator",
                "user_type": event["user_type"],
                "user_name": event["user_name"],
                "is_typing": event["is_typing"],
            }
        )

    @extend_ws_schema(
        type="send",
        summary="Send read receipt",
        description="Send read receipt notification to conversation participants",
        request=ReadReceiptSerializer,
        responses=MessageListSerializer,
    )
    async def read_receipt(self, event):
        """Handle read receipt events - now sends updated message list"""
        await self.send_success_response(
            {
                "type": "message",
                "data": event["data"],
            }
        )

    async def conversation_status(self, event):
        """Handle conversation status changes"""
        await self.send_json(
            {
                "type": "conversation_status",
                "status": event["status"],
                "updated_by": event["updated_by"],
            }
        )

    @database_sync_to_async
    def update_user_status(self, is_online: bool):
        """Update user online status if needed"""
        try:
            # This could be implemented to track user online status
            # For now, we'll leave it as a placeholder
            pass
        except Exception as e:
            print(f"Error updating user status: {e}")

    receive = receive_chat  # Alias for receive_chat method
    chat_message = send_message  # Alias for send_message method
