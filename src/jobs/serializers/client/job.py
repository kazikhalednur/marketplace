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
        super().validate(attrs)

        min_budget = attrs.get("min_budget")
        if min_budget is not None and min_budget <= 0:
            raise serializers.ValidationError(
                {"min_budget": "Minimum budget cannot be less than or equal to 0"}
            )

        max_budget = attrs.get("max_budget")
        if (
            min_budget is not None
            and max_budget is not None
            and min_budget > max_budget
        ):
            raise serializers.ValidationError(
                {"max_budget": "Maximum budget cannot be less than minimum budget"}
            )

        min_proposal_count = attrs.get("min_proposal_count")
        if min_proposal_count is not None and min_proposal_count <= 0:
            raise serializers.ValidationError(
                {
                    "min_proposal_count": ("Minimum proposal count cannot")
                    + (" be less than or equal to 0")
                }
            )

        max_proposal_count = attrs.get("max_proposal_count")
        if (
            min_proposal_count is not None
            and max_proposal_count is not None
            and min_proposal_count > max_proposal_count
        ):
            raise serializers.ValidationError(
                {
                    "max_proposal_count": ("Maximum proposal count cannot")
                    + (" be less than minimum proposal count")
                }
            )

        if self.instance and self.instance.status in [
            Job.JobStatus.DRAFT,
            Job.JobStatus.OPEN,
        ]:
            if attrs.get("status") not in [Job.JobStatus.DRAFT, Job.JobStatus.OPEN]:
                raise serializers.ValidationError(
                    {
                        "status": ("Cannot modify status of a job to ")
                        + (f"{attrs.get('status')} that is in draft or open")
                    }
                )

        if self.instance and self.instance.status in [
            Job.JobStatus.IN_PROGRESS,
            Job.JobStatus.COMPLETED,
            Job.JobStatus.CLOSED,
        ]:
            raise serializers.ValidationError(
                {
                    "status": ("Cannot modify status of a job that is in progress,")
                    + (" completed or closed")
                }
            )

        return attrs
