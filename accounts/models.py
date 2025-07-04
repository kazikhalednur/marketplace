from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class User(AbstractUser):
    class UserRole(models.TextChoices):
        CLIENT = "client", "Client"
        FREELANCER = "freelancer", "Freelancer"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.FREELANCER,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


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
            update_fields.remove("role")
        kwargs["update_fields"] = update_fields
        super(Client, self).save(*args, **kwargs)


class FreelancerManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.UserRole.FREELANCER)


class Freelancer(User):
    role = User.UserRole.FREELANCER

    objects = FreelancerManager()

    class Meta:
        proxy = True
        verbose_name = "Freelancer"
        verbose_name_plural = "Freelancers"

    def save(self, *args, **kwargs):
        self.role = self.UserRole.FREELANCER

        # Remove 'role' from update_fields if present
        update_fields = kwargs.pop("update_fields", None)
        if update_fields:
            update_fields.remove("role")
        kwargs["update_fields"] = update_fields
        super(Freelancer, self).save(*args, **kwargs)
