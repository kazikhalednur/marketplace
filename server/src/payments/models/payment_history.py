from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from accounts.models import User
from jobs.models import Job


class PaymentHistory(models.Model):
    class PaymentHistoryStatus(models.TextChoices):
        PROCESSING = "PROCESSING", "Processing"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELED = "CANCELED", "Canceled"
        REFUND = "REFUND", "Refund"

    id = models.UUIDField(primary_key=True, editable=False, serialize=False)
    job: Job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="payment_history"
    )
    user: User = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="payment_history"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="BDT")
    status = models.CharField(
        max_length=20,
        choices=PaymentHistoryStatus.choices,
        default=PaymentHistoryStatus.PROCESSING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"{self.job.title} - {self.status}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super(PaymentHistory, self).save(*args, **kwargs)
