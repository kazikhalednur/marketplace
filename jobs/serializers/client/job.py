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
        representation["skills"] = ClientSkillSerializer(
            instance.skills.all(), many=True
        ).data
        return representation

    def validate(self, attrs):
        min_budget = attrs.get("min_budget")
        max_budget = attrs.get("max_budget")
        if (
            min_budget is not None
            and max_budget is not None
            and min_budget > max_budget
        ):
            raise serializers.ValidationError(
                "Minimum budget cannot be greater than maximum budget"
            )

        min_hourly_rate = attrs.get("min_hourly_rate")
        max_hourly_rate = attrs.get("max_hourly_rate")
        if (
            min_hourly_rate is not None
            and max_hourly_rate is not None
            and min_hourly_rate > max_hourly_rate
        ):
            raise serializers.ValidationError(
                "Minimum hourly rate cannot be greater than maximum hourly rate"
            )

        min_proposal_count = attrs.get("min_proposal_count")
        max_proposal_count = attrs.get("max_proposal_count")
        if (
            min_proposal_count is not None
            and max_proposal_count is not None
            and min_proposal_count > max_proposal_count
        ):
            raise serializers.ValidationError(
                "Minimum proposal count cannot be greater than maximum proposal count"
            )

        return attrs
