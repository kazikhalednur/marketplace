from django.utils import timezone
from rest_framework import serializers

from .models import ZoomMeeting
from .zoom_utils import ZoomUtility


class ZoomMeetingSerializer(serializers.ModelSerializer):
    """Serializer for ZoomMeeting model"""

    created_by = serializers.StringRelatedField(read_only=True)
    created_by_id = serializers.IntegerField(write_only=True)
    conversation = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ZoomMeeting
        fields = [
            "id",
            "conversation",
            "zoom_id",
            "topic",
            "duration",
            "start_time",
            "join_url",
            "start_url",
            "created_by",
            "created_by_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "conversation",
            "zoom_id",
            "join_url",
            "start_url",
            "created_at",
            "updated_at",
        ]


class ZoomMeetingCreateSerializer(serializers.Serializer):
    """Serializer for creating Zoom meetings"""

    topic = serializers.CharField(max_length=400)
    duration = serializers.IntegerField(
        min_value=1, max_value=1440
    )  # 1 minute to 24 hours
    start_time = serializers.DateTimeField()
    join_url = serializers.URLField(max_length=10000, read_only=True)
    start_url = serializers.URLField(max_length=10000, read_only=True)

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
        if value > 1440:  # 24 hours
            raise serializers.ValidationError("Duration cannot exceed 24 hours")
        return value

    def create(self, validated_data):
        """
        Create a Zoom meeting and save to database
        """
        conversation = self.context.get("conversation")
        if not conversation:
            raise serializers.ValidationError("Conversation is required")

        try:
            # Create Zoom meeting using the utility
            zoom_utility = ZoomUtility()
            zoom_result = zoom_utility.create_meeting(
                topic=validated_data["topic"],
                start_time=validated_data["start_time"],
                duration=validated_data["duration"],
            )

            if not zoom_result["success"]:
                raise serializers.ValidationError(
                    f"Failed to create Zoom meeting: {zoom_result['error']}"
                )

            # Create meeting in database
            meeting_data = {
                "zoom_id": zoom_result["zoom_id"],
                "topic": zoom_result["topic"],
                "duration": zoom_result["duration"],
                "start_time": validated_data[
                    "start_time"
                ],  # Use the validated start_time
                "join_url": zoom_result["join_url"],
                "start_url": zoom_result["start_url"],
                "conversation": conversation,
                "created_by": self.context.get("created_by"),
            }

            return ZoomMeeting.objects.create(**meeting_data)

        except Exception as e:
            raise serializers.ValidationError(f"Error creating Zoom meeting: {str(e)}")


class ZoomMeetingUpdateSerializer(serializers.Serializer):
    """Serializer for updating Zoom meetings"""

    topic = serializers.CharField(max_length=200, required=False)
    duration = serializers.IntegerField(min_value=1, max_value=1440, required=False)
    start_time = serializers.DateTimeField(required=False)
    timezone = serializers.CharField(max_length=50, required=False)
    password = serializers.CharField(max_length=10, required=False, allow_blank=True)

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
        if value > 1440:  # 24 hours
            raise serializers.ValidationError("Duration cannot exceed 24 hours")
        return value

    def update(self, instance, validated_data):
        """
        Update a Zoom meeting
        """
        try:
            # Update Zoom meeting using the utility
            zoom_utility = ZoomUtility()
            zoom_result = zoom_utility.update_meeting(
                meeting_id=instance.zoom_id, **validated_data
            )

            if not zoom_result["success"]:
                raise serializers.ValidationError(
                    f"Failed to update Zoom meeting: {zoom_result['error']}"
                )

            # Update local database instance
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            return instance

        except Exception as e:
            raise serializers.ValidationError(f"Error updating Zoom meeting: {str(e)}")


class ZoomMeetingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing Zoom meetings"""

    created_by = serializers.StringRelatedField(read_only=True)
    is_upcoming = serializers.SerializerMethodField()
    is_past = serializers.SerializerMethodField()

    class Meta:
        model = ZoomMeeting
        fields = [
            "id",
            "zoom_id",
            "topic",
            "duration",
            "start_time",
            "join_url",
            "start_url",
            "created_by",
            "created_at",
            "updated_at",
            "is_upcoming",
            "is_past",
        ]
        read_only_fields = fields

    def get_is_upcoming(self, obj):
        """Check if meeting is upcoming"""
        if obj.start_time:
            from django.utils import timezone

            return obj.start_time > timezone.now()
        return False

    def get_is_past(self, obj):
        """Check if meeting is past"""
        if obj.start_time:
            from django.utils import timezone

            return obj.start_time < timezone.now()
        return False


class ZoomMeetingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Zoom meeting details"""

    created_by = serializers.StringRelatedField(read_only=True)
    conversation_id = serializers.CharField(
        source="conversation.conversation_id", read_only=True
    )
    zoom_meeting_details = serializers.SerializerMethodField()

    class Meta:
        model = ZoomMeeting
        fields = [
            "id",
            "conversation",
            "conversation_id",
            "zoom_id",
            "topic",
            "duration",
            "start_time",
            "join_url",
            "start_url",
            "created_by",
            "created_at",
            "updated_at",
            "zoom_meeting_details",
        ]
        read_only_fields = fields

    def get_zoom_meeting_details(self, obj):
        """Get detailed information from Zoom API"""
        try:
            zoom_utility = ZoomUtility()
            result = zoom_utility.get_meeting(obj.zoom_id)

            if result["success"]:
                return {
                    "start_time": result.get("start_time"),
                    "timezone": result.get("timezone"),
                    "password": result.get("password"),
                    "status": result.get("status"),
                    "created_at": result.get("created_at"),
                }
            else:
                return {"error": result.get("error")}
        except Exception as e:
            return {"error": str(e)}


class ZoomMeetingStatsSerializer(serializers.Serializer):
    """Serializer for Zoom meeting statistics"""

    total_meetings = serializers.IntegerField()
    upcoming_meetings = serializers.IntegerField()
    past_meetings = serializers.IntegerField()
    meetings_this_month = serializers.IntegerField()
    meetings_this_year = serializers.IntegerField()
    total_duration_minutes = serializers.IntegerField()
    average_duration_minutes = serializers.FloatField()


class ZoomRegistrantSerializer(serializers.Serializer):
    """Serializer for adding meeting registrants"""

    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    organization = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )
    job_title = serializers.CharField(max_length=100, required=False, allow_blank=True)
    comments = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate_email(self, value):
        """Validate email format"""
        if not value or "@" not in value:
            raise serializers.ValidationError("Invalid email format")
        return value
