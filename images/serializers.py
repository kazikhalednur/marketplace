from rest_framework import serializers

from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
