from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from accounts.models import FreelancerSubProfile
from jobs.models import Job


class Proposal(models.Model):
    class BidStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        REVIEWED = "reviewed", "Reviewed"
        ACCEPTED = "accepted", "Accepted"
        CLOSED = "closed", "Closed"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, editable=False, serialize=False)
    freelancer_sub_profile = models.ForeignKey(
        FreelancerSubProfile, related_name="proposals", on_delete=models.CASCADE
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="proposals")
    cover_letter = models.TextField()
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_connects = models.PositiveIntegerField(blank=True, null=True)
    status = models.CharField(
        max_length=10, choices=BidStatus.choices, default=BidStatus.PENDING
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"Bid by {self.freelancer_sub_profile.freelancer_profile.freelancer.username} for {self.job.title} - {self.status}"  # noqa: E501

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        if self.job.is_fixed:
            self.bid_amount = self.job.min_budget
        super().save(*args, **kwargs)
