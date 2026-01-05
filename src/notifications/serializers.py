from rest_framework import serializers

from .models import Notification


class SendNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "message_type", "message", "is_read", "created_at"]


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["user", "message_type", "message"]
        extra_kwargs = {
            "user": {"required": True},
            "message_type": {"required": True},
            "message": {"required": True},
        }


class NotificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "message_type",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class SendNotificationOutputSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    page = serializers.IntegerField()
    page_size = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    results = SendNotificationSerializer(many=True)


class SendNotificationInputSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["ping", "get_notifications"])
    page = serializers.IntegerField(default=1, required=False)
    page_size = serializers.IntegerField(default=10, required=False)
