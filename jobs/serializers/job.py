from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from ..models import Category, Job
from .client import ClientSerializer
from .skills import SkillSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "slug"]


class JobSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    skills = SkillSerializer(many=True)
    created_by = ClientSerializer()
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
            "duration",
            "experience_level",
            "min_proposal_count",
            "max_proposal_count",
            "created_by",
            "created_at",
            "status",
            "is_applied",
        ]

    @extend_schema_field(serializers.BooleanField)
    def get_is_applied(self, obj):
        user = self.context.get("request").user
        if user.is_authenticated:
            return obj.proposals.filter(
                freelancer_sub_profile__freelancer_profile__freelancer__id=user.id
            ).exists()
        return False
