from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from custom_admin.filters import ImageAdminFilter
from custom_admin.mixins import BaseAdminViewSetMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.images import ImageAdminSerializer
from images.models import Image


class ImageAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Image model."""

    queryset = Image.objects.all().select_related("uploaded_by").order_by("-created_at")
    serializer_class = ImageAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ImageAdminFilter
    search_fields = ["uploaded_by__email", "uploaded_by__username"]
    ordering_fields = ["created_at", "updated_at"]
