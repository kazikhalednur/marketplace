from custom_admin.serializers.base import AdminModelSerializer
from images.models import Image


class ImageAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Image
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
