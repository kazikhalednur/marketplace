from django.contrib import admin

from .models import Conversation, Message, MessageSeen


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "conversation_id",
        "status",
        "contract_title",
        "participants",
        "message_count",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["conversation_id", "contract__job__title"]
    readonly_fields = ["conversation_id", "created_at"]

    def contract_title(self, obj):
        return obj.contract.job.title if obj.contract and obj.contract.job else "N/A"

    contract_title.short_description = "Contract Title"

    def participants(self, obj):
        if obj.contract:
            freelancer = (
                obj.contract.freelancer_sub_profile.freelancer_profile.freelancer.username  # noqa: E501
                if obj.contract.freelancer_sub_profile
                else "N/A"
            )
            client = (
                obj.contract.proposal.job.created_by.username
                if obj.contract.proposal
                else "N/A"
            )
            return f"Freelancer: {freelancer} | Client: {client}"
        return "N/A"

    participants.short_description = "Participants"

    def message_count(self, obj):
        return obj.messages.count()

    message_count.short_description = "Messages"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "conversation",
        "sender_info",
        "text_preview",
        "is_read",
        "timestamp",
    ]
    list_filter = ["is_read", "timestamp", "conversation__status"]
    search_fields = ["text", "conversation__conversation_id"]
    readonly_fields = ["timestamp"]

    def sender_info(self, obj):
        if obj.freelancer_profile:
            return f"Freelancer: {obj.freelancer_profile.freelancer.username}"
        elif obj.client_profile:
            return f"Client: {obj.client_profile.client.username}"
        return "Unknown"

    sender_info.short_description = "Sender"

    def text_preview(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text

    text_preview.short_description = "Message Preview"


@admin.register(MessageSeen)
class MessageSeenAdmin(admin.ModelAdmin):
    list_display = ["id", "message", "seen_by_info", "seen_at"]
    list_filter = ["seen_at"]
    search_fields = ["message__text", "message__conversation__conversation_id"]
    readonly_fields = ["seen_at"]

    def seen_by_info(self, obj):
        if obj.freelancer_profile:
            return f"Freelancer: {obj.freelancer_profile.freelancer.username}"
        elif obj.client_profile:
            return f"Client: {obj.client_profile.client.username}"
        return "Unknown"

    seen_by_info.short_description = "Seen By"
