from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from biding.models import Attachment, Contract, Proposal
from custom_admin.filters import (
    BidingAttachmentAdminFilter,
    ContractAdminFilter,
    ProposalAdminFilter,
)
from custom_admin.mixins import BaseAdminViewSetMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.biding import (
    AttachmentAdminSerializer,
    ContractAdminSerializer,
    ProposalAdminSerializer,
)


class ProposalAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Proposal model."""

    queryset = Proposal.objects.all().select_related("job")
    serializer_class = ProposalAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProposalAdminFilter
    search_fields = ["cover_letter", "job__title"]
    ordering_fields = ["created_at", "updated_at", "budget"]


class ContractAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Contract model."""

    queryset = Contract.objects.all().select_related("job").order_by("-start_date")
    serializer_class = ContractAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ContractAdminFilter
    search_fields = ["job__title"]
    ordering_fields = ["start_date", "end_date", "budget"]


class AttachmentAdminViewSet(BaseAdminViewSetMixin, viewsets.ModelViewSet):
    """Admin ViewSet for Attachment model."""

    queryset = Attachment.objects.all().select_related("proposal")
    serializer_class = AttachmentAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = BidingAttachmentAdminFilter
    search_fields = ["file_name"]
    ordering_fields = ["created_at", "updated_at"]
