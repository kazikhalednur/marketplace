from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from chat.models import Conversation, Message
from custom_admin.filters import MessageAdminFilter
from custom_admin.mixins import BaseAdminViewSetMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.chat import (
    ConversationAdminSerializer,
    MessageAdminSerializer,
)


class ConversationAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Conversation model."""

    queryset = Conversation.objects.all().order_by("-created_at")
    serializer_class = ConversationAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["conversation_id"]
    ordering_fields = ["created_at"]


class MessageAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Message model."""

    queryset = Message.objects.all().order_by("-timestamp")
    serializer_class = MessageAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = MessageAdminFilter
    search_fields = ["text"]
    ordering_fields = ["timestamp"]
