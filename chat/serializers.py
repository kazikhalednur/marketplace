from rest_framework import serializers

from accounts.models import ClientProfile, FreelancerProfile

from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    contract_title = serializers.CharField(source="contract.job.title", read_only=True)
    freelancer_name = serializers.CharField(
        source="contract.freelancer_sub_profile.freelancer_profile.freelancer.username",
        read_only=True,
    )
    client_name = serializers.CharField(
        source="contract.proposal.job.created_by.username", read_only=True
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "conversation_id",
            "status",
            "created_at",
            "contract_title",
            "freelancer_name",
            "client_name",
            "last_message",
            "unread_count",
        ]

    def get_last_message(self, obj):
        last_message = obj.messages.order_by("-timestamp").first()
        if last_message:
            return {
                "text": last_message.text,
                "timestamp": last_message.timestamp,
                "sender_type": (
                    "freelancer" if last_message.freelancer_profile else "client"
                ),
                "sender_name": (
                    last_message.freelancer_profile.freelancer.username
                    if last_message.freelancer_profile
                    else last_message.client_profile.client.username
                ),
            }
        return None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        try:
            if hasattr(user, "freelancerprofile"):
                return obj.messages.filter(
                    is_read=False, client_profile__isnull=False
                ).count()
            elif hasattr(user, "clientprofile"):
                return obj.messages.filter(
                    is_read=False, freelancer_profile__isnull=False
                ).count()
        except Exception:
            pass
        return 0


class MessageSerializer(serializers.ModelSerializer):
    sender_type = serializers.SerializerMethodField()
    sender_name = serializers.SerializerMethodField()
    is_own_message = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "text",
            "timestamp",
            "is_read",
            "sender_type",
            "sender_name",
            "is_own_message",
        ]

    def get_sender_type(self, obj):
        return "freelancer" if obj.freelancer_profile else "client"

    def get_sender_name(self, obj):
        if obj.freelancer_profile:
            return obj.freelancer_profile.freelancer.username
        return obj.client_profile.client.username

    def get_is_own_message(self, obj):
        user = self.context["request"].user
        if obj.freelancer_profile and obj.freelancer_profile.freelancer == user:
            return True
        if obj.client_profile and obj.client_profile.client == user:
            return True
        return False


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["text"]

    def create(self, validated_data):
        conversation = self.context["conversation"]
        user = self.context["request"].user

        # Determine if user is freelancer or client
        try:
            freelancer_profile = FreelancerProfile.objects.get(freelancer=user)
            validated_data["freelancer_profile"] = freelancer_profile
        except FreelancerProfile.DoesNotExist:
            try:
                client_profile = ClientProfile.objects.get(client=user)
                validated_data["client_profile"] = client_profile
            except ClientProfile.DoesNotExist:
                raise serializers.ValidationError("User profile not found")

        validated_data["conversation"] = conversation
        return super().create(validated_data)


class ConversationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["status"]
