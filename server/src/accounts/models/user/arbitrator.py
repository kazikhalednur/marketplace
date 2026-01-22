from django.contrib.auth.models import UserManager

from .base import User


class ArbitratorManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.UserRole.ARBITRATOR)


class Arbitrator(User):
    role = User.UserRole.ARBITRATOR or None

    objects = ArbitratorManager()

    class Meta:
        proxy = True
        verbose_name = "Arbitrator"
        verbose_name_plural = "Arbitrators"

    def save(self, *args, **kwargs):
        self.role = self.UserRole.ARBITRATOR

        # Remove 'role' from update_fields if present
        update_fields = kwargs.pop("update_fields", None)
        if update_fields:
            if "role" in update_fields:
                update_fields.remove("role")
        kwargs["update_fields"] = update_fields
        super(Arbitrator, self).save(*args, **kwargs)
