from django.conf import settings
from rest_framework import serializers

from accounts.models import Client, Freelancer

from .models import Meeting, MeetingHistory


class FreelancerSerializer(serializers.ModelSerializer):
    """Serializer for Freelancer model"""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Freelancer
        fields = ["username", "email", "full_name"]

    def get_full_name(self, obj):
        return obj.get_full_name()


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for Client model"""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ["username", "email", "full_name"]

    def get_full_name(self, obj):
        return obj.get_full_name()


class MeetingSerializer(serializers.ModelSerializer):
    """Serializer for Meeting model"""

    guest = FreelancerSerializer(read_only=True)
    guest_username = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "room_name",
            "topic",
            "duration",
            "start_date",
            "start_time",
            "guest",
            "guest_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "room_name", "created_at", "updated_at"]

    def create(self, validated_data):
        guest_username = validated_data.pop("guest_username")
        try:
            guest = Freelancer.objects.get(username=guest_username)
        except Freelancer.DoesNotExist:
            raise serializers.ValidationError({"username": "Freelancer not found"})

        validated_data["guest"] = guest
        return super().create(validated_data)


class MeetingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing meetings"""

    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    guest_name = serializers.CharField(source="guest.get_full_name", read_only=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "room_name",
            "topic",
            "duration",
            "start_date",
            "start_time",
            "created_by_name",
            "guest_name",
            "created_at",
        ]


class MeetingHistorySerializer(serializers.ModelSerializer):
    """Serializer for MeetingHistory model"""

    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    meeting_topic = serializers.CharField(source="meeting.topic", read_only=True)
    room_name = serializers.CharField(source="meeting.room_name", read_only=True)

    class Meta:
        model = MeetingHistory
        fields = [
            "id",
            "meeting",
            "meeting_topic",
            "room_name",
            "user",
            "user_name",
            "joined_at",
            "left_at",
        ]
        read_only_fields = ["id", "joined_at", "left_at"]


class ContractFreelancerSerializer(serializers.Serializer):
    username = serializers.CharField()
    full_name = serializers.CharField()
    contract_id = serializers.UUIDField()
    job_title = serializers.CharField()
    contract_status = serializers.CharField()


class MeetingJoinSerializer(serializers.Serializer):
    room_name = serializers.CharField()
    token = serializers.CharField()
    domain = serializers.CharField(
        default=getattr(settings, "JITSI_DOMAIN"),
    )
