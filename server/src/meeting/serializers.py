from django.conf import settings
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from accounts.models import Client, Freelancer
from biding.models import Contract

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

    contract = serializers.PrimaryKeyRelatedField(
        queryset=Contract.objects.active(), write_only=True
    )

    class Meta:
        model = Meeting
        fields = [
            "id",
            "room_name",
            "topic",
            "duration",
            "start_date",
            "start_time",
            "contract",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "room_name", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        contract = validated_data["contract"]

        if contract.client_profile != request.user.client_profile:
            raise serializers.ValidationError(
                {
                    "contract": "You are not authorized to create a meeting for this contract"  # noqa: E501
                }
            )

        return super().create(validated_data)


class MeetingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing meetings"""

    created_by = serializers.SerializerMethodField()
    guest = serializers.SerializerMethodField()
    job_title = serializers.CharField(source="contract.job.title", read_only=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "room_name",
            "topic",
            "duration",
            "start_date",
            "start_time",
            "created_by",
            "guest",
            "job_title",
            "created_at",
        ]

    @extend_schema_field(serializers.CharField())
    def get_created_by(self, obj):
        return obj.contract.client_profile.client.get_full_name()

    @extend_schema_field(serializers.CharField())
    def get_guest(self, obj):
        return obj.contract.freelancer_profile.freelancer.get_full_name()


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
