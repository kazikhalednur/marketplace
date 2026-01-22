from rest_framework import serializers

from ..models import Category
from .skills import SkillSerializer


class CategorySkillSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["name", "slug", "skills"]
