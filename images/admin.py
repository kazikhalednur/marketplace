from django.contrib import admin

from .models import Image


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ("id", "uploaded_by", "created_at", "updated_at")
    search_fields = ("uploaded_by__username", "uploaded_by__email")
    readonly_fields = ("id", "created_at", "updated_at")
