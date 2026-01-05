from django.db import models

from payments.models import InitiatePayment

from .job import Job


class JobPayment(models.Model):
    job: Job = models.ForeignKey(Job, on_delete=models.CASCADE)
    payment: InitiatePayment = models.ForeignKey(
        InitiatePayment, on_delete=models.CASCADE, related_name="job_payments"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Job Payment"
        verbose_name_plural = "Job Payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Job Payment - {self.job.title} - {self.payment.tran_id}"
