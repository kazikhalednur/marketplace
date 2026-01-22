from django.db import models

from ..profile import FreelancerProfile


class ConnectHistory(models.Model):
    class ConnectChangeType(models.TextChoices):
        ADD = "add", "Added"
        DEDUCT = "deduct", "Deducted"

    profile = models.ForeignKey(
        FreelancerProfile, on_delete=models.CASCADE, related_name="connect_history"
    )
    change_type = models.CharField(max_length=10, choices=ConnectChangeType.choices)
    connects_changed = models.IntegerField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
