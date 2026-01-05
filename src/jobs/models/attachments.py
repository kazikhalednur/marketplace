from django.db import models
from simple_history.models import HistoricalRecords

from utils.validators import validate_file_size

from .job import Job


class Attachment(models.Model):
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="attachments",
        help_text="Job to which the attachment belongs",
    )
    file = models.FileField(
        upload_to="attachments/",
        help_text="Attachment file",
        validators=[validate_file_size],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, help_text="Upload timestamp")
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Attachment"
        verbose_name_plural = "Attachments"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"Attachment for {self.job.title} - {self.file.name}"

    def delete(self, *args, **kwargs):
        self.file.delete(save=False)
        super().delete(*args, **kwargs)
