from rest_framework import serializers

from ...models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ("id", "file")

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "file": instance.file.url,
        }
