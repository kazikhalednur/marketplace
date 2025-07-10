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
    hours_per_week = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Hours per Week",
        help_text="The number of hours you can work per week",
    )
    is_more_available = models.BooleanField(
        default=True,
        verbose_name="More Available",
        help_text="Are you available for more work?",
    )
    hour_rate = models.DecimalField(
        blank=True,
        null=True,
        max_digits=10,
        decimal_places=2,
        verbose_name="Hourly Rate",
        help_text="Your hourly rate in USD",
    )
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Freelancer Profile"
        verbose_name_plural = "Freelancer Profiles"

    def __str__(self):
        return f"{self.freelancer.username}'s Profile"
