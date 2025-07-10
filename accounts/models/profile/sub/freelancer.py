from django.db import models

from ..freelancer import FreelancerProfile


class FreelancerSubProfile(models.Model):
    profile = models.OneToOneField(
        FreelancerProfile,
        on_delete=models.CASCADE,
        related_name="freelancer_sub_profile",
        verbose_name="Freelancer Sub Profile",
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
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description",
        help_text="A brief description of your skills and experience",
    )

    class Meta:
        verbose_name = "Freelancer Sub Profile"
        verbose_name_plural = "Freelancer Sub Profiles"

    def __str__(self):
        return f"{self.profile.freelancer.username}'s Sub Profile"

    def save(self, *args, **kwargs):
        if self.hour_rate is not None and self.hour_rate < 0:
            raise ValueError("Hourly rate cannot be negative.")
        super().save(*args, **kwargs)
