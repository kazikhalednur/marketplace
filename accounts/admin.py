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
    WebSocketID,
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


class UserRoleAdmin(UserAdmin):
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


class FreelancerProfileInline(admin.StackedInline):
    model = FreelancerProfile
    can_delete = False


@admin.register(Freelancer)
class FreelancerAdmin(UserRoleAdmin):
    def student_id(self, obj):
        return (
            obj.freelancer_profile.student_id
            if hasattr(obj, "freelancer_profile")
            else None
        )

    inlines = (FreelancerProfileInline,)
    search_fields = UserRoleAdmin.search_fields + ("freelancer_profile__student_id",)
    list_display = UserRoleAdmin.list_display + ("student_id",)


class ClientProfileInline(admin.StackedInline):
    model = ClientProfile
    can_delete = False


@admin.register(Client)
class ClientAdmin(UserRoleAdmin):
    inlines = (ClientProfileInline,)


@admin.register(Arbitrator)
class ArbitratorAdmin(UserRoleAdmin):
    pass


@admin.register(Auditor)
class AuditorAdmin(UserRoleAdmin):
    pass


admin.site.register(OTP)
admin.site.register(FreelancerSubProfile)
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Project)
admin.site.register(WebSocketID)

admin.site.register(ClientProfile)
admin.site.register(FreelancerProfile)
