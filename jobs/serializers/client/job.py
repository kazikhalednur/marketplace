from rest_framework import serializers

from ...models import Job


class ClientJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
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
        ]
