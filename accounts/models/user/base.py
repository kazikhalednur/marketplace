from uuid import uuid4

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

from ...tokens import email_verify_token


class CustomUserManager(UserManager):
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.update({"role": User.UserRole.ADMIN})
        return super().create_superuser(email=email, password=password, **extra_fields)


class User(AbstractUser):
    class UserRole(models.TextChoices):
        CLIENT = "client", "Client"
        FREELANCER = "freelancer", "Freelancer"
        ADMIN = "admin", "Admin"
        ARBITRATOR = "arbitrator", "Arbitrator"
        AUDITOR = "auditor", "Auditor"

    id = models.UUIDField(
        primary_key=True, editable=False, serialize=False, unique=True
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=20, blank=True, null=True, help_text="Phone number"
    )
    sub = models.CharField(
        max_length=100, unique=True, blank=True, null=True, help_text="Google user ID"
    )
    is_google_login = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.FREELANCER,
    )

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super(User, self).save(*args, **kwargs)

    def check_email_verification_token(self, token):
        """
        Check if the provided token is valid for this user.
        """
        return email_verify_token.check_token(self, token)

    def generate_email_verification_token(self):
        """
        Generate a token for email verification.
        """
        return email_verify_token.make_token(self)
