from rest_framework import serializers

from accounts.models import Client

from ...models import Job


class ClientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    is_payment_verified = serializers.BooleanField(
        source="client_profile.is_payment_verified", read_only=True
    )

    class Meta:
        model = Client
        fields = ["full_name", "is_payment_verified", "date_joined"]


class ClientJobSerializer(serializers.ModelSerializer):
    created_by = ClientSerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "description",
            "tags",
            "category",
            "skills",
            "min_budget",
            "max_budget",
            "is_fixed",
            "min_hourly_rate",
            "max_hourly_rate",
            "duration",
            "experience_level",
            "min_proposal_count",
            "max_proposal_count",
            "status",
            "category",
            "skills",
            "created_by",
            "created_at",
        ]
