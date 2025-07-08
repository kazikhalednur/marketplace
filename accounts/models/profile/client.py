from django.db import models

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

    class Meta:
        verbose_name = "Client Profile"
        verbose_name_plural = "Client Profiles"

    def __str__(self):
        return f"{self.client.username}'s Profile"
