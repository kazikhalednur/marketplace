from django.contrib.auth.models import UserManager

from .base import User


class AuditorManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.UserRole.AUDITOR)


class Auditor(User):
    role = User.UserRole.AUDITOR or None

    objects = AuditorManager()

    class Meta:
        proxy = True
        verbose_name = "Auditor"
        verbose_name_plural = "Auditors"

    def save(self, *args, **kwargs):
        self.role = self.UserRole.AUDITOR

        # Remove 'role' from update_fields if present
        update_fields = kwargs.pop("update_fields", None)
        if update_fields:
            if "role" in update_fields:
                update_fields.remove("role")
        kwargs["update_fields"] = update_fields
        super(Auditor, self).save(*args, **kwargs)
