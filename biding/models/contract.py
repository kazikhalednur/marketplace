from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from accounts.models import ClientProfile, FreelancerProfile, FreelancerSubProfile
from jobs.models import Job

from .proposal import Proposal


class Contract(models.Model):
    class ContractStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(
        primary_key=True, editable=False, serialize=False, unique=True
    )
    freelancer_profile: FreelancerProfile = models.ForeignKey(
        FreelancerProfile, related_name="contracts", on_delete=models.CASCADE
    )
    freelancer_sub_profile = models.ForeignKey(
        FreelancerSubProfile, related_name="contracts", on_delete=models.CASCADE
    )
    client_profile: ClientProfile = models.ForeignKey(
        ClientProfile, related_name="contracts", on_delete=models.CASCADE
    )
    proposal = models.OneToOneField(
        Proposal, related_name="contract", on_delete=models.CASCADE
    )
    job: Job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="contracts"
    )
    budget = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=ContractStatus.choices, default=ContractStatus.ACTIVE
    )
    history = HistoricalRecords()

    def __str__(self):
        return f"Contract for {self.job.title} between {self.client_profile.client.username} and {self.freelancer_profile.freelancer.username}"  # noqa: E501

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super().save(*args, **kwargs)
