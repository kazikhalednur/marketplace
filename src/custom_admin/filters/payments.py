import django_filters

from payments.models import (
    PaymentHistory,
    PaymentRequest,
    PaymentTransaction,
)


class PaymentRequestAdminFilter(django_filters.FilterSet):
    class Meta:
        model = PaymentRequest
        fields = []


class PaymentTransactionAdminFilter(django_filters.FilterSet):
    payment_request = django_filters.UUIDFilter(
        field_name="payment_request", lookup_expr="exact"
    )

    class Meta:
        model = PaymentTransaction
        fields = ["payment_request"]


class PaymentHistoryAdminFilter(django_filters.FilterSet):
    user = django_filters.UUIDFilter(field_name="user", lookup_expr="exact")

    class Meta:
        model = PaymentHistory
        fields = ["user"]
