from rest_framework import serializers

from accounts.models import Client


class ClientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    is_payment_verified = serializers.BooleanField(
        source="client_profile.is_payment_verified", read_only=True
    )

    class Meta:
        model = Client
        fields = ["full_name", "is_payment_verified", "date_joined"]
