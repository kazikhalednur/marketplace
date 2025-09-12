from django.db import models


class SSLCommerzConfig(models.Model):
    """SSLCommerz payment gateway configuration model"""

    name = models.CharField(
        max_length=100,
        verbose_name="Configuration Name",
        help_text="A descriptive name for this configuration",
    )

    environment = models.CharField(
        max_length=20,
        choices=[
            ("SANDBOX", "Sandbox"),
            ("LIVE", "Live"),
        ],
        default="SANDBOX",
        verbose_name="Environment",
    )

    store_id = models.CharField(
        max_length=100, verbose_name="Store ID", help_text="Your SSLCommerz store ID"
    )

    store_password = models.CharField(
        max_length=200,
        verbose_name="Store Password",
        help_text="Your SSLCommerz store password",
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="Is Active",
        help_text="Whether this configuration is currently active",
    )

    api_url = models.URLField(
        verbose_name="API URL",
        help_text="SSLCommerz API endpoint URL",
    )

    validation_url = models.URLField(
        verbose_name="Validation URL",
        help_text="SSLCommerz validation endpoint URL",
    )

    success_url = models.URLField(
        verbose_name="Success URL",
        help_text="URL to redirect after successful payment",
    )

    fail_url = models.URLField(
        verbose_name="Fail URL",
        help_text="URL to redirect after failed payment",
    )

    cancel_url = models.URLField(
        verbose_name="Cancel URL",
        help_text="URL to redirect after cancelled payment",
    )

    ipn_url = models.URLField(
        verbose_name="IPN URL",
        help_text="URL for Instant Payment Notification",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        verbose_name = "SSLCommerz Configuration"
        verbose_name_plural = "SSLCommerz Configurations"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.environment})"
