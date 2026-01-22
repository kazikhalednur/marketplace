from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from custom_admin.filters import (
    PaymentHistoryAdminFilter,
    PaymentTransactionAdminFilter,
)
from custom_admin.mixins import AdminPermissionMixin, HistoryMixin, ReadOnlyAdminMixin
from custom_admin.pagination import AdminPagination
from custom_admin.serializers.payments import (
    PaymentCallbackLogAdminSerializer,
    PaymentHistoryAdminSerializer,
    PaymentRequestAdminSerializer,
    PaymentTransactionAdminSerializer,
)
from payments.models import (
    PaymentCallbackLog,
    PaymentHistory,
    PaymentRequest,
    PaymentTransaction,
)


class PaymentRequestAdminViewSet(
    ReadOnlyAdminMixin,
    AdminPermissionMixin,
    HistoryMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """Admin ViewSet for PaymentRequest model (READ-ONLY)."""

    queryset = PaymentRequest.objects.all().order_by("-created_at")
    serializer_class = PaymentRequestAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["user__email", "user__username", "transaction_id"]
    ordering_fields = ["created_at", "updated_at", "amount"]


class PaymentTransactionAdminViewSet(
    ReadOnlyAdminMixin,
    AdminPermissionMixin,
    HistoryMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """Admin ViewSet for PaymentTransaction model (READ-ONLY)."""

    queryset = (
        PaymentTransaction.objects.all()
        .select_related("payment_request")
        .order_by("-created_at")
    )
    serializer_class = PaymentTransactionAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = PaymentTransactionAdminFilter
    search_fields = ["transaction_id", "payment_request__user__email"]
    ordering_fields = ["created_at", "updated_at", "amount"]


class PaymentHistoryAdminViewSet(
    ReadOnlyAdminMixin,
    AdminPermissionMixin,
    HistoryMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """Admin ViewSet for PaymentHistory model (READ-ONLY)."""

    queryset = PaymentHistory.objects.all().order_by("-created_at")
    serializer_class = PaymentHistoryAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = PaymentHistoryAdminFilter
    search_fields = ["user__email", "user__username", "description"]
    ordering_fields = ["created_at", "amount"]


class PaymentCallbackLogAdminViewSet(
    ReadOnlyAdminMixin,
    AdminPermissionMixin,
    HistoryMixin,
    viewsets.ReadOnlyModelViewSet,
):
    """Admin ViewSet for PaymentCallbackLog model (READ-ONLY)."""

    queryset = PaymentCallbackLog.objects.all()
    serializer_class = PaymentCallbackLogAdminSerializer
    pagination_class = AdminPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    search_fields = ["callback_data"]
    ordering_fields = ["created_at"]
