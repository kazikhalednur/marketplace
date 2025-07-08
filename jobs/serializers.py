from rest_framework import serializers

from .models import Category, Job


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        exclude = ["created_at", "updated_at"]


class JobSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Job
        exclude = ["created_at", "updated_at"]
        depth = 1
