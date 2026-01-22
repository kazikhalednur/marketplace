from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from custom_admin.filters import NotificationAdminFilter
from custom_admin.mixins import BaseAdminViewSetMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.notifications import NotificationAdminSerializer
from notifications.models import Notification


class NotificationAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Notification model."""

    queryset = Notification.objects.all().select_related("user").order_by("-created_at")
    serializer_class = NotificationAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = NotificationAdminFilter
    search_fields = ["message", "user__email", "user__username"]
    ordering_fields = ["created_at"]
