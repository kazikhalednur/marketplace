from django.contrib import admin

from .models import GoogleMeeting


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
