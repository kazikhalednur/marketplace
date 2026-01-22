from django.db import models
from simple_history.models import HistoricalRecords

from ..user.client import Client


class ClientProfile(models.Model):
    client: Client = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name="client_profile",
        verbose_name="Client",
    )
    company_name = models.CharField(
        max_length=255,
        verbose_name="Company Name",
        blank=True,
        null=True,
    )
    is_payment_verified = models.BooleanField(
        default=False, verbose_name="Payment Verified"
    )
    is_phone_verified = models.BooleanField(
        default=False, verbose_name="Phone Verified"
    )
    twitter = models.URLField(blank=True, null=True, verbose_name="Twitter Profile")
    linkedin = models.URLField(blank=True, null=True, verbose_name="LinkedIn Profile")
    bio = models.TextField(blank=True, null=True)
    avatar = models.URLField(
        max_length=255, blank=True, null=True, verbose_name="Avatar URL"
    )
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Client Profile"
        verbose_name_plural = "Client Profiles"

    def __str__(self):
        return f"{self.client.username}'s Profile"
