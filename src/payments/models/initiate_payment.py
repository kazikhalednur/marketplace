import uuid

from django.db import models

from accounts.models import User


class InitiatePayment(models.Model):
    """Payment model for handling payment transactions"""

    # Primary key - UUID field
    id = models.UUIDField(
        primary_key=True, editable=False, verbose_name="Transaction ID"
    )
    tran_id = models.CharField(unique=True, verbose_name="Transaction ID")
    user: User = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="initiate_payments",
    )

    # Payment details
    total_amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Total Amount"
    )
    currency = models.CharField(max_length=3, default="BDT", verbose_name="Currency")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    # Response parameters
    class Status(models.TextChoices):
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    status = models.CharField(
        max_length=20, choices=Status.choices, verbose_name="Payment Status"
    )
    failedreason = models.TextField(blank=True, null=True, verbose_name="Failed Reason")
    sessionkey = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Session Key"
    )
    GatewayPageURL = models.URLField(
        blank=True, null=True, verbose_name="Gateway Page URL"
    )

    class Meta:
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Payment {self.tran_id} - {self.user.username} "
            f"({self.total_amount} {self.currency})"
        )

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid.uuid4()
        super(InitiatePayment, self).save(*args, **kwargs)
