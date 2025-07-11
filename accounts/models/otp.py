from uuid import uuid4

from django.db import models
from django.utils import timezone
from simple_history.models import HistoricalRecords

from base.models import Settings as base_settings

from .user import User


class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "OTP"
        verbose_name_plural = "OTPs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"OTP for {self.user.email} - {self.code}"

    def save(self, *args, **kwargs):
        self.code = str(uuid4()).upper()[:6]
        super().save(*args, **kwargs)

    def is_expired(self):
        return (timezone.now() - self.created_at).seconds > base_settings.OTP_TIMEOUT
