from django.contrib import admin

from .models import GoogleMeeting, ZoomMeeting


@admin.register(GoogleMeeting)
class GoogleMeetingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "url",
        "summary",
        "description",
        "start_time",
        "end_time",
        "attendees",
        "created_by",
        "created_at",
        "updated_at",
    )
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(ZoomMeeting)
class ZoomMeetingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "zoom_id",
        "topic",
        "duration",
        "start_time",
        "join_url",
        "start_url",
        "created_by",
        "created_at",
        "updated_at",
    )
    readonly_fields = ("id", "created_at", "updated_at")
