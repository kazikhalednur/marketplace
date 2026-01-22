from custom_admin.serializers.base import AdminModelSerializer
from payments.models import (
    PaymentCallbackLog,
    PaymentHistory,
    PaymentRequest,
    PaymentTransaction,
)


class PaymentRequestAdminSerializer(AdminModelSerializer):
    class Meta:
        model = PaymentRequest
        fields = "__all__"


class PaymentTransactionAdminSerializer(AdminModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = "__all__"


class PaymentHistoryAdminSerializer(AdminModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = "__all__"


class PaymentCallbackLogAdminSerializer(AdminModelSerializer):
    class Meta:
        model = PaymentCallbackLog
        fields = "__all__"
