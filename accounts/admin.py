from django.contrib import admin

from .models import Client, Freelancer, User

admin.site.register(User)
admin.site.register(Client)
admin.site.register(Freelancer)
