from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from accounts.models import FreelancerProfile

from .milestone import MilestoneStep


class MilestoneStepSubmission(models.Model):
    class Status(models.TextChoices):
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        PENDING = "pending", "Pending"

    id = models.UUIDField(
        primary_key=True, editable=False, unique=True, serialize=False
    )
    milestone_step: MilestoneStep = models.ForeignKey(
        MilestoneStep, on_delete=models.CASCADE, related_name="submissions"
    )
    freelancer_profile = models.ForeignKey(
        FreelancerProfile,
        on_delete=models.CASCADE,
        related_name="milestone_submissions",
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    message = models.TextField(blank=True, null=True)
    code_zip = models.FileField(upload_to="milestone_submissions/zips/")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    history = HistoricalRecords()

    def __str__(self):
        return f"Submission for {self.milestone_step.title} - {self.status}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super().save(*args, **kwargs)
