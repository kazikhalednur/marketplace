from rest_framework import serializers

from .models import GoogleMeeting
from .utils import create_google_meeting


class GoogleMeetingSerializer(serializers.ModelSerializer):
    """Serializer for GoogleMeeting model"""

    created_by = serializers.StringRelatedField(read_only=True)
    created_by_id = serializers.IntegerField(write_only=True)
    conversation = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = GoogleMeeting
        fields = [
            "id",
            "conversation",
            "url",
            "summary",
            "description",
            "start_time",
            "end_time",
            "attendees",
            "created_by",
            "created_by_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "conversation",
            "created_at",
            "updated_at",
        ]

    def validate_attendees(self, value):
        """Validate that attendees list has at least 2 emails and max 2 emails"""
        if len(value) < 2:
            raise serializers.ValidationError("At least 2 attendees are required")
        if len(value) > 2:
            raise serializers.ValidationError("Maximum 2 attendees allowed")

        # Validate email format
        for email in value:
            if not email or "@" not in email:
                raise serializers.ValidationError(f"Invalid email format: {email}")

        return value

    def validate_end_time(self, value):
        """Validate that end time is after start time"""
        start_time = self.initial_data.get("start_time")
        if start_time and value <= start_time:
            raise serializers.ValidationError("End time must be after start time")
        return value


class GoogleMeetingCreateSerializer(serializers.Serializer):
    summary = serializers.CharField(max_length=255)
    description = serializers.CharField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()

    def validate(self, data):
        start_time = data.get("start_time")
        end_time = data.get("end_time")

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time")

        return data

    def create(self, validated_data):
        """
        Create a Google Calendar meeting and save to database
        """
        conversation = self.context.get("conversation")
        if not conversation:
            raise serializers.ValidationError("Conversation is required")

        # Get attendees from conversation participants
        attendees = [
            conversation.freelancer_profile.freelancer.email,
            conversation.client_profile.client.email,
        ]

        try:
            # Create Google Calendar meeting
            google_result = create_google_meeting(
                summary=validated_data["summary"],
                description=validated_data["description"],
                start_time=validated_data["start_time"],
                end_time=validated_data["end_time"],
                attendees=attendees,
                timezone="Asia/Dhaka",  # Default timezone
            )

            if not google_result["success"]:
                raise serializers.ValidationError(
                    f"Failed to create Google Calendar meeting: {google_result['error']}"  # noqa: E501
                )

            # Create meeting in database
            meeting_data = {
                "url": google_result["meeting_url"],
                "summary": google_result["meeting_summary"],
                "description": google_result["meeting_description"],
                "start_time": google_result["meeting_start_time"],
                "end_time": google_result["meeting_end_time"],
                "attendees": google_result["meeting_attendees"],
                "conversation": conversation,
                "created_by": self.context.get("created_by"),
            }

            return GoogleMeeting.objects.create(**meeting_data)

        except Exception as e:
            raise serializers.ValidationError(f"Error creating meeting: {str(e)}")


class GoogleMeetingUpdateSerializer(serializers.Serializer):
    summary = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False)
    start_time = serializers.DateTimeField(required=False)
    end_time = serializers.DateTimeField(required=False)
    attendees = serializers.ListField(
        child=serializers.EmailField(), min_length=1, max_length=1, required=False
    )
    timezone = serializers.CharField(
        default="Asia/Dhaka", max_length=50, required=False
    )

    def validate_attendees(self, value):
        """Validate attendees list if provided"""
        if value and len(value) != 1:
            raise serializers.ValidationError("Exactly 1 attendee is required")
        return value

    def validate(self, data):
        """Validate that end time is after start time if both are provided"""
        start_time = data.get("start_time")
        end_time = data.get("end_time")

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time")

        return data


class GoogleMeetingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing meetings"""

    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = GoogleMeeting
        fields = [
            "id",
            "url",
            "summary",
            "description",
            "start_time",
            "end_time",
            "created_by",
            "created_at",
        ]
        read_only_fields = fields
