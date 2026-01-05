from rest_framework import serializers


class InitiatePaymentResponseSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=20)
    failedreason = serializers.CharField(
        max_length=200, allow_blank=True, allow_null=True, required=False
    )
    GatewayPageURL = serializers.URLField(
        max_length=200, allow_blank=True, allow_null=True, required=False
    )
