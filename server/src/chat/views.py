from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, permissions
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ClientProfile, FreelancerProfile

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationStatusSerializer,
    CreateMessageSerializer,
    MessageSerializer,
)


class ConversationListView(generics.ListAPIView):
    """List all conversations for the authenticated user"""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Get user profile
        try:
            freelancer_profile = FreelancerProfile.objects.get(freelancer=user)
            # Get conversations where user is freelancer
            return Conversation.objects.filter(
                freelancer_profile=freelancer_profile
            ).order_by("-created_at")
        except FreelancerProfile.DoesNotExist:
            try:
                client_profile = ClientProfile.objects.get(client=user)
                # Get conversations where user is client
                return Conversation.objects.filter(
                    client_profile=client_profile
                ).order_by("-created_at")
            except ClientProfile.DoesNotExist:
                return Conversation.objects.none()


class ConversationDetailView(generics.RetrieveAPIView):
    """Get conversation details"""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        conversation_id = self.kwargs.get("conversation_id")
        return get_object_or_404(Conversation, conversation_id=conversation_id)


class MessageListView(generics.ListCreateAPIView):
    """List and create messages for a conversation"""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateMessageSerializer
        return MessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        return Message.objects.filter(conversation=conversation).order_by("timestamp")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        conversation_id = self.kwargs.get("conversation_id")
        context["conversation"] = get_object_or_404(
            Conversation, conversation_id=conversation_id
        )
        return context

    def perform_create(self, serializer):
        conversation = self.get_serializer_context()["conversation"]
        serializer.save()

        # Mark other messages as read
        user = self.request.user
        try:
            FreelancerProfile.objects.get(freelancer=user)
            # Mark client messages as read
            Message.objects.filter(
                conversation=conversation, client_profile__isnull=False, is_read=False
            ).update(is_read=True)
        except FreelancerProfile.DoesNotExist:
            try:
                ClientProfile.objects.get(client=user)
                # Mark freelancer messages as read
                Message.objects.filter(
                    conversation=conversation,
                    freelancer_profile__isnull=False,
                    is_read=False,
                ).update(is_read=True)
            except ClientProfile.DoesNotExist:
                pass


class MarkMessageAsReadView(APIView):
    """Mark a specific message as read"""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name="MarkMessageAsReadViewResponse",
                fields={
                    "status": drf_serializers.CharField(
                        default="Message marked as read"
                    )
                },
            )
        },
    )
    def post(self, request, conversation_id, message_id):
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        message = get_object_or_404(Message, id=message_id, conversation=conversation)

        user = request.user

        try:
            message.mark_as_read(user)
            return Response({"status": "Message marked as read"})
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MarkAllMessagesAsReadView(APIView):
    """Mark all messages in a conversation as read"""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name="MarkAllMessagesAsReadViewResponse",
                fields={
                    "status": drf_serializers.CharField(
                        default="All messages marked as read"
                    )
                },
            )
        },
    )
    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, conversation_id=conversation_id)
        user = request.user

        try:
            # Mark all messages as read
            messages = Message.objects.filter(
                conversation=conversation, is_read=False
            ).exclude(
                **{
                    f"{'freelancer' if hasattr(user, 'freelancerprofile') else 'client'}_profile": None  # noqa: E501
                }
            )

            for message in messages:
                message.mark_as_read(user)

            return Response({"status": "All messages marked as read"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ConversationStatusView(generics.UpdateAPIView):
    """Update conversation status"""

    serializer_class = ConversationStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        conversation_id = self.kwargs.get("conversation_id")
        return get_object_or_404(Conversation, conversation_id=conversation_id)
