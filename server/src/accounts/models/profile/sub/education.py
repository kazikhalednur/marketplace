from django.db import models
from simple_history.models import HistoricalRecords

from .freelancer import FreelancerSubProfile


class Education(models.Model):
    sub_profile = models.ForeignKey(
        FreelancerSubProfile,
        on_delete=models.CASCADE,
        related_name="educations",
        verbose_name="Freelancer Sub Profile",
    )
    institution_name = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    area_of_study = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Education"
        verbose_name_plural = "Educations"

    def __str__(self):
        return f"{self.degree} in {self.area_of_study} from {self.institution_name} ({self.start_date} - {self.end_date})"  # noqa: E501
