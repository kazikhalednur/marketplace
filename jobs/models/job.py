from django.contrib.postgres.fields import ArrayField
from django.db import models

from accounts.models import User  # Assuming User model is defined in accounts app

from .category import Category


class Job(models.Model):
    class JobStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    title = models.CharField(max_length=255)
    description = models.TextField()
    tags = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        default=list,
        help_text="List of tags associated with the job",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="jobs",
        help_text="Category to which the job belongs",
    )
    currency = models.CharField(
        max_length=10,
        default="USD",
        help_text="Currency for the job payment",
    )
    min_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Minimum budget for the job",
    )
    max_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Maximum budget for the job",
    )
    is_fixed = models.BooleanField(default=True, help_text="Is the job budget fixed?")
    min_hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Minimum hourly rate for the job (if applicable)",
    )
    max_hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Maximum hourly rate for the job (if applicable)",
    )
    duration = models.CharField(
        max_length=50,
        help_text="Estimated duration for the job (e.g., '1 month', '3 months')",
    )
    experience_level = models.CharField(
        max_length=50,
        choices=[
            ("entry", "Entry Level"),
            ("intermediate", "Intermediate"),
            ("expert", "Expert"),
        ],
        help_text="Required experience level for the job",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_jobs",
        help_text="User who created the job",
    )
    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.DRAFT,
        help_text="Current status of the job",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Job"
        verbose_name_plural = "Jobs"
        ordering = ["-created_at"]
