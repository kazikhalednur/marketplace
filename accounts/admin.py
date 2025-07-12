from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    OTP,
    AcceptedDomain,
    Arbitrator,
    Auditor,
    Client,
    ClientProfile,
    Education,
    Experience,
    Freelancer,
    FreelancerProfile,
    FreelancerSubProfile,
    Project,
    User,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        (
            "Personal info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "role",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )

    list_display = ("email", "first_name", "last_name", "is_staff")
    list_filter = ("role", "is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("first_name", "last_name", "email")
    ordering = ("id",)


@admin.register(AcceptedDomain)
class AcceptedDomainAdmin(admin.ModelAdmin):
    list_display = ("domain", "is_active")
    search_fields = ("domain",)
    ordering = ("-created_at",)


@admin.register(Freelancer)
class FreelancerAdmin(UserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        (
            "Personal info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                )
            },
        ),
        (
            "Verification",
            {"fields": ("email_verified",)},
        ),
        (
            "Google Login",
            {"fields": ("is_google_login",)},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "role",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )

    list_display = ("email", "first_name", "last_name")
    list_filter = ("is_active", "groups")
    search_fields = ("first_name", "last_name", "email")
    ordering = ("id",)


@admin.register(Client)
class ClientAdmin(FreelancerAdmin):
    pass


@admin.register(Arbitrator)
class ArbitratorAdmin(FreelancerAdmin):
    pass


@admin.register(Auditor)
class AuditorAdmin(FreelancerAdmin):
    pass


admin.site.register(OTP)
admin.site.register(ClientProfile)
admin.site.register(FreelancerProfile)
admin.site.register(FreelancerSubProfile)
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Project)
