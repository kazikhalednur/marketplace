from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Attachment, Category, Job, JobPayment, Skill

admin.site.register(Category, SimpleHistoryAdmin)
admin.site.register(Attachment, SimpleHistoryAdmin)
admin.site.register(Skill, SimpleHistoryAdmin)
admin.site.register(JobPayment, SimpleHistoryAdmin)


@admin.register(Job)
class JobAdmin(SimpleHistoryAdmin):
    list_display = ("title", "created_by", "status", "created_at", "updated_at")
    readonly_fields = ("id", "created_at", "updated_at")
    list_filter = ("status", "created_by", "created_at", "updated_at")
    search_fields = ("title", "created_by__username", "created_by__email")
    list_per_page = 10
    list_max_show_all = 100

    readonly_fields = ("id", "created_at", "updated_at", "is_payment_verified")
