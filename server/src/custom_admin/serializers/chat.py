from chat.models import Conversation, Message
from custom_admin.serializers.base import AdminModelSerializer


class ConversationAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Conversation
        fields = "__all__"
        read_only_fields = ("id", "conversation_id", "created_at")


class MessageAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ("id", "timestamp")
