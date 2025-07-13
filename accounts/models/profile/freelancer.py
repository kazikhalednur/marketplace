from django.db import models
from simple_history.models import HistoricalRecords

from ..user.freelancer import Freelancer


class FreelancerProfile(models.Model):
    freelancer = models.OneToOneField(
        Freelancer,
        on_delete=models.CASCADE,
        related_name="freelancer_profile",
        verbose_name="Freelancer",
    )
    student_id = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Student ID",
        help_text="Your student ID, e.g., 2019-12345-1",
    )
    is_available = models.BooleanField(default=True)
    available_connects = models.PositiveIntegerField(default=30)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Freelancer Profile"
        verbose_name_plural = "Freelancer Profiles"

    def __str__(self):
        return f"{self.freelancer.username}'s Profile"

    # def use_connects(self, job, amount, reason="Job Application"):
    #     if self.available_connects < amount:
    #         raise ValueError("Not enough connects.")

    #     # Check if already applied
    #     if ConnectUsage.objects.filter(profile=self, job=job).exists():
    #         raise ValueError("Already applied to this job.")

    #     # Deduct connects
    #     self.available_connects -= amount
    #     self.save()

    #     # Record usage
    #     return ConnectUsage.objects.create(
    #         profile=self,
    #         job=job,
    #         used_connects=amount,
    #         reason=reason
    #     )

    # def add_connects(self, amount, reason="Admin Top-up"):
    #     self.available_connects += amount
    #     self.save()
    #     return ConnectHistory.objects.create(
    #         profile=self,
    #         change_type='add',
    #         connects_changed=amount,
    #         reason=reason
    #     )
