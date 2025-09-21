from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Meeting


@admin.register(Meeting)
class MeetingAdmin(SimpleHistoryAdmin):
    list_display = (
        "id",
        "topic",
        "conversation",
        "meeting_id",
        "created_by",
    )
