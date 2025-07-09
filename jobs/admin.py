from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Attachment, Category, Job, Skill

admin.site.register(Category, SimpleHistoryAdmin)
admin.site.register(Job, SimpleHistoryAdmin)
admin.site.register(Attachment, SimpleHistoryAdmin)
admin.site.register(Skill, SimpleHistoryAdmin)
