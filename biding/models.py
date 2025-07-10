from django.db import models
from simple_history.models import HistoricalRecords

from accounts.models import FreelancerProfile
from jobs.models import Job


class Bid(models.Model):
    class BidStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    profile = models.ForeignKey(FreelancerProfile, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    proposal = models.TextField()
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_connects = models.PositiveIntegerField()
    status = models.CharField(
        max_length=10,
        choices=BidStatus.choices,
        default=BidStatus.PENDING,
        help_text="Current status of the bid",
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"Bid by {self.profile.freelancer.username} for {self.job.title} - {self.status}"  # noqa: E501
