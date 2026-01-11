from custom_admin.serializers.base import AdminModelSerializer
from notifications.models import Notification


class NotificationAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ("id", "created_at")
