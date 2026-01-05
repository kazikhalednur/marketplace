from django.contrib.auth.models import UserManager

from .base import User


class ClientManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.UserRole.CLIENT)


class Client(User):
    role = User.UserRole.CLIENT or None

    objects = ClientManager()

    class Meta:
        proxy = True
        verbose_name = "Client"
        verbose_name_plural = "Clients"

    def save(self, *args, **kwargs):
        self.role = self.UserRole.CLIENT

        # Remove 'role' from update_fields if present
        update_fields = kwargs.pop("update_fields", None)
        if update_fields:
            if "role" in update_fields:
                update_fields.remove("role")
        kwargs["update_fields"] = update_fields
        super(Client, self).save(*args, **kwargs)
