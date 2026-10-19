from django.contrib import admin

from .models import Settings


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.site_header = "Marketplace Admin"
admin.site.site_title = "Marketplace Admin"
admin.site.index_title = "Marketplace Admin Dashboard"
