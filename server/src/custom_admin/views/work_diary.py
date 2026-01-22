from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from custom_admin.filters import MilestoneAdminFilter, MilestoneStepAdminFilter
from custom_admin.mixins import BaseAdminViewSetMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.work_diary import (
    MilestoneAdminSerializer,
    MilestoneStepAdminSerializer,
)
from work_diary.models import Milestone, MilestoneStep


class MilestoneAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Milestone model."""

    queryset = Milestone.objects.all().select_related("contract")
    serializer_class = MilestoneAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = MilestoneAdminFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "due_date"]


class MilestoneStepAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for MilestoneStep model."""

    queryset = MilestoneStep.objects.all().select_related("milestone")
    serializer_class = MilestoneStepAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = MilestoneStepAdminFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at"]
