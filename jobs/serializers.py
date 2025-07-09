from rest_framework import serializers

from accounts.models import Client

from .models import Category, Currency, Job, Skill


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["name", "slug"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["name", "slug"]


class CategorySkillSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["name", "slug", "skills"]


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["name", "symbol"]


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
    currency = CurrencySerializer(read_only=True)
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


class DropdownCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class DropdownSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "slug"]


class DropdownCurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["id", "name", "symbol"]


class DropdownStatusSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return [
            {"label": label, "value": value} for value, label in Job.JobStatus.choices
        ]


class DropdownExperienceLevelSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return [
            {"label": label, "value": value}
            for value, label in Job.JobExperienceLevel.choices
        ]


class DropdownSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return {
            "categories": DropdownCategorySerializer(
                Category.objects.all(), many=True
            ).data,
            "skills": DropdownSkillSerializer(Skill.objects.all(), many=True).data,
            "currencies": DropdownCurrencySerializer(
                Currency.objects.all(), many=True
            ).data,
            "status": DropdownStatusSerializer().to_representation(None),
            "experience_levels": DropdownExperienceLevelSerializer().to_representation(
                None
            ),
        }


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
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
            "status",
            "category",
            "skills",
            "currency",
        ]
