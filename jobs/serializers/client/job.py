from rest_framework import serializers

from ...models import Job
from .category import ClientCategorySerializer
from .client_data import ClientSerializer
from .skills import ClientSkillSerializer


class ClientJobSerializer(serializers.ModelSerializer):
    created_by = ClientSerializer(read_only=True)
    category_detail = serializers.SerializerMethodField()
    skill_detail = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "description",
            "tags",
            "category",
            "category_detail",
            "skills",
            "skill_detail",
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

    def get_category_detail(self, obj):
        return ClientCategorySerializer(obj.category).data

    def get_skill_detail(self, obj):
        return ClientSkillSerializer(obj.skills, many=True).data
