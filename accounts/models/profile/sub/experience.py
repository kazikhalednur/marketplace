from django.db import models
from simple_history.models import HistoricalRecords

from .freelancer import FreelancerSubProfile


class Experience(models.Model):
    sub_profile = models.ForeignKey(
        FreelancerSubProfile,
        on_delete=models.CASCADE,
        related_name="experiences",
        verbose_name="Freelancer Sub Profile",
    )
    job_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_present = models.BooleanField(default=False, verbose_name="Is Present")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Experience"
        verbose_name_plural = "Experiences"

    def __str__(self):
        return f"{self.job_title} at {self.company_name} ({self.start_date} - {self.end_date})"  # noqa: E501
