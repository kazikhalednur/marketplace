from django.db import models
from simple_history.models import HistoricalRecords

from ..user.client import Client


class ClientProfile(models.Model):
    client = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name="client_profile",
        verbose_name="Client",
    )
    company_name = models.CharField(
        max_length=255,
        verbose_name="Company Name",
        help_text="The name of your company or organization.",
        blank=True,
        null=True,
    )
    is_payment_verified = models.BooleanField(
        default=False,
        verbose_name="Payment Verified",
        help_text="Indicates whether the client's payment has been verified.",
    )
    is_phone_verified = models.BooleanField(
        default=False,
        verbose_name="Phone Verified",
        help_text="Indicates whether the client's phone number has been verified.",
    )
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Client Profile"
        verbose_name_plural = "Client Profiles"

    def __str__(self):
        return f"{self.client.username}'s Profile"
