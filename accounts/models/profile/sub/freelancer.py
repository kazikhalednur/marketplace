from django.db import models
from simple_history.models import HistoricalRecords

from ..freelancer import FreelancerProfile


class FreelancerSubProfile(models.Model):
    freelancer_profile = models.ForeignKey(
        FreelancerProfile,
        on_delete=models.CASCADE,
        related_name="freelancer_sub_profiles",
        verbose_name="Freelancer Sub Profile",
    )
    hours_per_week = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name="Hours per Week",
    )
    is_more_available = models.BooleanField(
        default=True,
        verbose_name="More Available",
    )
    hour_rate = models.DecimalField(
        blank=True,
        null=True,
        max_digits=10,
        decimal_places=2,
        verbose_name="Hourly Rate",
    )
    bio = models.TextField(blank=True, null=True, verbose_name="Bio")
    linkedin = models.URLField(blank=True, null=True, verbose_name="LinkedIn Profile")
    twitter = models.URLField(blank=True, null=True, verbose_name="Twitter Profile")
    github = models.URLField(blank=True, null=True, verbose_name="GitHub Profile")
    portfolio = models.URLField(blank=True, null=True, verbose_name="Portfolio URL")
    skills = models.ManyToManyField(
        "jobs.Skill",
        blank=True,
        related_name="freelancer_sub_profiles",
        verbose_name="Skills",
    )
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Freelancer Sub Profile"
        verbose_name_plural = "Freelancer Sub Profiles"

    def __str__(self):
        return f"{self.freelancer_profile.freelancer.username}'s Sub Profile"

    def save(self, *args, **kwargs):
        if self.hour_rate is not None and self.hour_rate < 0:
            raise ValueError("Hourly rate cannot be negative.")
        super().save(*args, **kwargs)
