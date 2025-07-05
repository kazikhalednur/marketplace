from uuid import uuid4

from django.conf import settings
from django.db import models
from django.utils import timezone

from .user import User


class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.code = str(uuid4()).upper()[:6]
        super().save(*args, **kwargs)

    def is_expired(self):
        return (timezone.now() - self.created_at).seconds > settings.OTP_TIMEOUT
