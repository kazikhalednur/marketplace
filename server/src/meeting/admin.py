from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Meeting, MeetingHistory


@admin.register(Meeting)
class MeetingAdmin(SimpleHistoryAdmin):
    pass


@admin.register(MeetingHistory)
class MeetingHistoryAdmin(SimpleHistoryAdmin):
    pass
