from django.db import models

from jobs.models import Job

from ..profile import FreelancerProfile


class ConnectUsage(models.Model):
    profile = models.ForeignKey(
        FreelancerProfile, on_delete=models.CASCADE, related_name="connect_usages"
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    used_connects = models.PositiveIntegerField(default=1)
    reason = models.CharField(max_length=255, default="Job Application")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["profile", "job"], name="unique_connect_usage"
            )
        ]
