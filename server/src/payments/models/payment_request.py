from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from .payment_history import PaymentHistory
from .utils import generate_short_uid


class PaymentRequest(models.Model):

    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, editable=False, serialize=False)
    payment_history = models.OneToOneField(
        PaymentHistory, on_delete=models.CASCADE, related_name="payment_request"
    )
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    reference = models.CharField(max_length=255, blank=True)

    checkout_items = models.JSONField(blank=True, null=True)
    opt_a = models.CharField(max_length=25, blank=True, null=True)
    opt_b = models.CharField(max_length=25, blank=True, null=True)
    opt_c = models.CharField(max_length=25, blank=True, null=True)

    # response fields
    status_code = models.CharField(max_length=10, blank=True, null=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.CREATED
    )
    message = models.TextField(blank=True, null=True)
    payment_url = models.TextField(blank=True, null=True)
    payment_url_expiry = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    history = HistoricalRecords()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.invoice_number} - {self.status}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        if not self.invoice_number:
            self.invoice_number = generate_short_uid()
        super(PaymentRequest, self).save(*args, **kwargs)

    def update_invoice_number(self):
        self.invoice_number = generate_short_uid()
        self.save(update_fields=["invoice_number"])
