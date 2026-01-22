from django.db import models
from simple_history.models import HistoricalRecords

from .freelancer import FreelancerSubProfile


class Project(models.Model):
    sub_profile = models.ForeignKey(
        FreelancerSubProfile,
        on_delete=models.CASCADE,
        related_name="projects",
        verbose_name="Freelancer Sub Profile",
    )
    title = models.CharField(max_length=255)
    link = models.URLField(blank=True, null=True, verbose_name="Project Link")
    description = models.TextField()
    history = HistoricalRecords()

    def __str__(self):
        return self.title
