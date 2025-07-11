from rest_framework import serializers

from ...models import Category, Job, Skill


class DropdownCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class DropdownSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "slug"]


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


class DropdownPrivacySerializer(serializers.Serializer):
    def to_representation(self, instance):
        return [
            {"label": label, "value": value} for value, label in Job.JobPrivacy.choices
        ]


class DropdownSerializer(serializers.Serializer):
    def to_representation(self, instance):
        return {
            "categories": DropdownCategorySerializer(
                Category.objects.all(), many=True
            ).data,
            "skills": DropdownSkillSerializer(Skill.objects.all(), many=True).data,
            "status": DropdownStatusSerializer().to_representation(None),
            "experience_levels": DropdownExperienceLevelSerializer().to_representation(
                None
            ),
            "privacy": DropdownPrivacySerializer().to_representation(None),
        }
