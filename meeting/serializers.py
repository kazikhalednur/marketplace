from django.utils import timezone
from rest_framework import serializers

from accounts.models import User
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

    def validate_start_time(self, value):
        """Validate that start time is in the future"""
        now = timezone.now()
        if value <= now:
            raise serializers.ValidationError("Start time must be in the future")
        return value

    def validate_duration(self, value):
        """Validate duration is reasonable"""
        if value < 1:
            raise serializers.ValidationError("Duration must be at least 1 minute")
        if value > 60:  # 2 hours
            raise serializers.ValidationError("Duration cannot exceed 2 hours")
        return value

    def create(self, validated_data):
        """Create a Zoom meeting asynchronously"""
        conversation_id = self.context.get("conversation_id")
        created_by_email = self.context.get("created_by_email")

        if not conversation_id:
            raise serializers.ValidationError("Conversation ID is required")
        if not created_by_email:
            raise serializers.ValidationError("Created by user email is required")

        # Start the async task with IDs instead of objects
        create_zoom_meeting_task.delay(
            conversation_id=conversation_id,
            created_by_email=created_by_email,
            topic=validated_data["topic"],
            start_time=validated_data["start_time"],
            duration=validated_data["duration"],
        )

        # Return a placeholder meeting object
        # The actual meeting will be created by the Celery task
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
        required=False, min_value=1800, max_value=172800, write_only=True
    )
    videoWebRtcMode = serializers.IntegerField(
        required=False, min_value=0, max_value=1, write_only=True
    )
    signature = serializers.CharField(required=False, read_only=True)

    def validate_role(self, value):
        """Validate role is 0 (participant) or 1 (host)"""
        if value not in [0, 1]:
            raise serializers.ValidationError(
                "Role must be 0 (participant) or 1 (host)"
            )
        return value

    def validate_meetingNumber(self, value):
        """Validate meeting number is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Meeting number is required")
        return value.strip()
