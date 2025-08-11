from rest_framework import serializers

from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ["id", "image"]

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "image": f"https://cpchub.diu.edu.bd:8443{instance.image.url}",
        }
