from rest_framework import serializers

from ..models import Category, Job
from .client import ClientSerializer
from .skills import SkillSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "slug"]


class JobSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    created_by = ClientSerializer(read_only=True)
    is_applied = serializers.SerializerMethodField()

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
            "created_by",
            "created_at",
            "status",
            "is_applied",
        ]

    def get_is_applied(self, obj):
        print(self.context)
        user = self.context.get("request").user
        print(user)
        if user.is_authenticated:
            return obj.proposals.filter(
                freelancer_sub_profile__freelancer_profile__freelancer__id=user.id
            ).exists()
        return False
