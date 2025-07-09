from rest_framework import serializers

from accounts.models import Client

from .models import Category, Job, Skill


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "slug"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["name", "slug"]


class ClientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)
    is_payment_verified = serializers.BooleanField(
        source="client_profile.is_payment_verified", read_only=True
    )

    class Meta:
        model = Client
        fields = ["full_name", "is_payment_verified", "date_joined"]


class JobSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
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
            "currency",
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
        ]
