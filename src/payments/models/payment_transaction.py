from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from .payment_request import PaymentRequest


class PaymentTransaction(models.Model):

    class TransactionStatus(models.TextChoices):
        PROCESSING = "PROCESSING", "Processing"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELED = "CANCELED", "Canceled"
        REFUND = "REFUND", "Refund"

    id = models.UUIDField(primary_key=True, editable=False, serialize=False)
    payment_request = models.OneToOneField(
        PaymentRequest, on_delete=models.PROTECT, related_name="transaction"
    )

    trx_status = models.CharField(
        max_length=15,
        choices=TransactionStatus.choices,
        default=TransactionStatus.PROCESSING,
    )
    trx_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    payment_amount = models.DecimalField(
        max_digits=12, decimal_places=2, blank=True, null=True
    )
    order_date_time = models.DateTimeField(blank=True, null=True)
    payer_mobile_no = models.CharField(max_length=20, blank=True, null=True)
    payment_method = models.CharField(max_length=30, blank=True, null=True)

    trx_amount = models.PositiveIntegerField(blank=True, null=True)
    trx_date = models.DateField(blank=True, null=True)

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.payment_request.invoice_number} - {self.trx_id}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super(PaymentTransaction, self).save(*args, **kwargs)
