from rest_framework import serializers

from ...models import Attachment


class ClientAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ("id", "file")
