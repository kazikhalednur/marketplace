from uuid import uuid4

from django.db import models

from biding.models import Contract


class Milestone(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(
        primary_key=True, editable=False, unique=True, serialize=False
    )
    contract = models.ForeignKey(
        Contract, on_delete=models.CASCADE, related_name="milestones"
    )
    number_of_steps = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Milestone {self.number_of_steps} - {self.status}"


class MilestoneStep(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUBMITTED = "submitted", "Submitted"
        IN_REVIEW = "in_review", "In Review"
        ACCEPTED = "accepted", "Accepted"
        FAILED = "failed", "Failed"
        PAID = "paid", "Paid"

    id = models.UUIDField(
        primary_key=True, editable=False, unique=True, serialize=False
    )
    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name="steps"
    )
    step_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default="pending")

    class Meta:
        ordering = ["step_number"]

    def __str__(self):
        return f"Step {self.step_number} - {self.title}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super().save(*args, **kwargs)
