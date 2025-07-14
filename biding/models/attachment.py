from uuid import uuid4

from django.db import models
from simple_history.models import HistoricalRecords

from .proposal import Proposal


class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, serialize=False)
    proposal = models.ForeignKey(
        Proposal, related_name="attachments", on_delete=models.CASCADE
    )
    file = models.ImageField(upload_to="attachments/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"Attachment for {self.proposal.job.title} by {self.proposal.freelancer_sub_profile.freelancer_profile.freelancer.username}"  # noqa: E501

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.file.delete(save=False)
        super().delete(*args, **kwargs)
