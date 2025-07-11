from rest_framework import serializers

from ..models import Category, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["name", "slug"]


class CategorySkillSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["name", "slug", "skills"]
