from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "conversation_id",
        "status",
        "message_count",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = [
        "conversation_id",
        "freelancer_profile__freelancer__username",
        "client_profile__client__username",
    ]
    readonly_fields = [
        "conversation_id",
        "created_at",
        "freelancer_profile",
        "client_profile",
    ]

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
        "seen_info",
        "timestamp",
    ]
    list_filter = ["is_read", "timestamp", "conversation__status"]
    search_fields = ["text", "conversation__conversation_id"]
    readonly_fields = ["timestamp", "seen_by_freelancer_at", "seen_by_client_at"]

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

    def seen_info(self, obj):
        seen_list = []
        if obj.seen_by_freelancer_at:
            seen_list.append(
                f"Freelancer: {obj.seen_by_freelancer_at.strftime('%Y-%m-%d %H:%M')}"
            )
        if obj.seen_by_client_at:
            seen_list.append(
                f"Client: {obj.seen_by_client_at.strftime('%Y-%m-%d %H:%M')}"
            )
        return " | ".join(seen_list) if seen_list else "Not seen"

    seen_info.short_description = "Seen By"
