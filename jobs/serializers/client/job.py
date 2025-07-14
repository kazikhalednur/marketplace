from rest_framework import serializers

from ...models import Job
from .client_data import ClientSerializer


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
