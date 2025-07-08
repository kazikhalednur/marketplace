from django.contrib import admin

from .models import Category, Job

admin.site.register(Job)
admin.site.register(Category)
