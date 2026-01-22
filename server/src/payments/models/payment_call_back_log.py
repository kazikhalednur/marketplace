from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from .payment_request import PaymentRequest


class PaymentCallbackLog(models.Model):
    class PaymentCallbackLogStatus(models.TextChoices):
        SUCCESSFUL = "SUCCESSFUL", "Successful"
        FAILED = "FAILED", "Failed"
        CANCELED = "CANCELED", "Canceled"

    id = models.UUIDField(primary_key=True, editable=False, serialize=False)
    payment_request = models.OneToOneField(
        PaymentRequest, on_delete=models.CASCADE, related_name="callback_log"
    )
    trx_id = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=PaymentCallbackLogStatus.choices)
    message = models.TextField(blank=True, null=True)
    received_at = models.DateTimeField(auto_now_add=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.payment_request.payment_history.job.title} - {self.payment_request.invoice_number} - {self.status}"  # noqa: E501

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super(PaymentCallbackLog, self).save(*args, **kwargs)
