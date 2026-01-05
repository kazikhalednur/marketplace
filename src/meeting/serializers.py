from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
from chat.models import Conversation
from utils.helpers import extract_query_param

from .models import Meeting
from .tasks import create_zoom_meeting_task


class MeetingSerializer(serializers.ModelSerializer):
    signature = serializers.CharField(required=False, read_only=True)
    meeting_number = serializers.CharField(source="meeting_id", read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    zak = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "topic",
            "signature",
            "meeting_number",
            "password",
            "user_name",
            "user_email",
            "zak",
            "start_time",
            "duration",
            # "join_url",
            # "start_url",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        if self.context.get("conversation_id"):
            try:
                Conversation.objects.get(
                    conversation_id=self.context.get("conversation_id")
                )
            except Conversation.DoesNotExist:
                raise serializers.ValidationError(
                    {"detail": "No Conversation matches the given query."}
                )

        if attrs.get("start_time") and attrs.get("start_time") < timezone.now():
            raise serializers.ValidationError(
                {"start_time": "Start time must be in the future"}
            )

        if attrs.get("duration") < 30:
            raise serializers.ValidationError(
                {"duration": "Duration must be at least 30 minutes"}
            )

        if attrs.get("duration") > 60:
            raise serializers.ValidationError(
                {"duration": "Duration cannot exceed 1 hour"}
            )

        return attrs

    def create(self, validated_data):
        """Create a Zoom meeting asynchronously"""
        conversation_id = self.context.get("conversation_id")
        created_by_email = self.context.get("created_by_email")

        create_zoom_meeting_task.delay(
            conversation_id=conversation_id,
            created_by_email=created_by_email,
            topic=validated_data["topic"],
            start_time=validated_data["start_time"],
            duration=validated_data["duration"],
        )

        return Meeting(
            topic=validated_data["topic"],
            duration=validated_data["duration"],
            start_time=validated_data["start_time"],
        )

    def get_user_name(self, obj):
        return User.objects.get(email=self.context["created_by_email"]).get_full_name()

    def get_user_email(self, obj):
        return self.context["created_by_email"]

    def get_zak(self, obj):
        return extract_query_param(obj.start_url, "zak")


class ZoomMeetingSDKAuthSerializer(serializers.Serializer):
    """Serializer for Zoom Meeting SDK authentication"""

    meetingNumber = serializers.CharField(required=True, write_only=True)
    role = serializers.IntegerField(required=True, write_only=True)
    expirationSeconds = serializers.IntegerField(
        required=False, min_value=1800, max_value=7200, write_only=True
    )
    videoWebRtcMode = serializers.IntegerField(
        required=False, min_value=0, max_value=1, write_only=True
    )
    signature = serializers.CharField(required=False, read_only=True)

    def validate_role(self, value):
        if value not in [0, 1]:
            raise serializers.ValidationError(
                {"role": "Role must be 0 (participant) or 1 (host)"}
            )
        return value
