from rest_framework import serializers

from ...models import Job
from .category import ClientCategorySerializer
from .client_data import ClientSerializer
from .skills import ClientSkillSerializer


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
            "created_by",
            "created_at",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["category"] = ClientCategorySerializer(instance.category).data
        representation["skill"] = ClientSkillSerializer(
            instance.skills.all(), many=True
        ).data
        return representation
