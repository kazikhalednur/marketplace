from django.contrib import admin
from django.utils.html import format_html

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "message_type",
        "truncated_message",
        "is_read",
        "created_at",
        "days_ago",
    ]
    list_filter = ["message_type", "is_read", "created_at"]
    search_fields = ["user__username", "user__email", "message"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("User Information", {"fields": ("user",)}),
        ("Notification Content", {"fields": ("message_type", "message")}),
        ("Status", {"fields": ("is_read",)}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    def truncated_message(self, obj):
        """Display truncated message in list view"""
        if len(obj.message) > 50:
            return format_html(
                '<span title="{}">{}</span>', obj.message, obj.message[:50] + "..."
            )
        return obj.message

    truncated_message.short_description = "Message"

    def days_ago(self, obj):
        """Show how many days ago the notification was created"""

        from django.utils import timezone

        now = timezone.now()
        days = (now - obj.created_at).days

        if days == 0:
            return "Today"
        elif days == 1:
            return "Yesterday"
        elif days < 7:
            return f"{days} days ago"
        elif days < 30:
            weeks = days // 7
            return f'{weeks} week{"s" if weeks > 1 else ""} ago'
        else:
            months = days // 30
            return f'{months} month{"s" if months > 1 else ""} ago'

    days_ago.short_description = "Created"

    actions = ["mark_as_read", "mark_as_unread", "delete_selected"]

    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read"""
        updated = queryset.update(is_read=True)
        self.message_user(
            request,
            f'{updated} notification{"s" if updated > 1 else ""} marked as read.',
        )

    mark_as_read.short_description = "Mark selected notifications as read"

    def mark_as_unread(self, request, queryset):
        """Mark selected notifications as unread"""
        updated = queryset.update(is_read=False)
        self.message_user(
            request,
            f'{updated} notification{"s" if updated > 1 else ""} marked as unread.',
        )

    mark_as_unread.short_description = "Mark selected notifications as unread"

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related("user")

    def has_add_permission(self, request):
        """Allow adding notifications in admin"""
        return True

    def has_change_permission(self, request, obj=None):
        """Allow editing notifications in admin"""
        return True

    def has_delete_permission(self, request, obj=None):
        """Allow deleting notifications in admin"""
        return True
