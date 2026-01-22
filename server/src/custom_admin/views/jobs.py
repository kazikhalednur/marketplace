from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from custom_admin.filters import JobAdminFilter, JobAttachmentAdminFilter
from custom_admin.mixins import BaseAdminViewSetMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.jobs import (
    AttachmentAdminSerializer,
    CategoryAdminSerializer,
    JobAdminSerializer,
    SkillAdminSerializer,
)
from jobs.models import Attachment, Category, Job, Skill


class JobAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Job model."""

    queryset = (
        Job.objects.all()
        .select_related("category", "created_by")
        .prefetch_related("skills")
    )
    serializer_class = JobAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = JobAdminFilter
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["created_at", "updated_at", "min_budget", "max_budget"]


class CategoryAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Category model."""

    queryset = Category.objects.all().order_by("name")
    serializer_class = CategoryAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]


class SkillAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Skill model."""

    queryset = Skill.objects.all().order_by("name")
    serializer_class = SkillAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]


class AttachmentAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Attachment model."""

    queryset = Attachment.objects.all().select_related("job")
    serializer_class = AttachmentAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = JobAttachmentAdminFilter
    search_fields = ["file_name"]
    ordering_fields = ["created_at", "updated_at"]
