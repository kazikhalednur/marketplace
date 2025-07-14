from uuid import uuid4

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import Q
from simple_history.models import HistoricalRecords

from accounts.models import User

from .category import Category
from .skills import Skill


class JobManager(models.Manager):
    def published(self, **kwargs):
        return (
            self.filter(
                Q(status=Job.JobStatus.OPEN)
                | Q(status=Job.JobStatus.IN_PROGRESS)
                | Q(status=Job.JobStatus.COMPLETED)
                | Q(status=Job.JobStatus.CLOSED),
                **kwargs
            )
            .select_related("category")
            .prefetch_related("skills")
            .distinct()
        )

    def open(self, **kwargs):
        return (
            self.filter(status=Job.JobStatus.OPEN, **kwargs)
            .select_related("category")
            .prefetch_related("skills")
            .distinct()
        )


class Job(models.Model):
    class JobStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    class JobExperienceLevel(models.TextChoices):
        ENTRY = "entry", "Entry"
        INTERMEDIATE = "intermediate", "Intermediate"
        EXPERT = "expert", "Expert"

    class JobPrivacy(models.TextChoices):
        PUBLIC = "public", "Public"
        PRIVATE = "private", "Private"

    id = models.UUIDField(
        primary_key=True,
        editable=False,
        serialize=False,
        unique=True,
    )
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
    skills = models.ManyToManyField(
        Skill,
        related_name="jobs",
        blank=True,
        help_text="Skills required for the job",
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
        choices=JobExperienceLevel.choices,
        help_text="Required experience level for the job",
    )
    min_proposal_count = models.PositiveIntegerField(
        default=1,
        help_text="Minimum number of proposals required to consider the job",
    )
    max_proposal_count = models.PositiveIntegerField(
        help_text="Maximum number of proposals allowed for the job",
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
    connect = models.PositiveIntegerField(
        default=1,
        help_text="Number of connects required to apply for the job",
    )
    privacy = models.CharField(
        max_length=20,
        choices=JobPrivacy.choices,
        default=JobPrivacy.PUBLIC,
        help_text="Visibility of the job",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    objects: JobManager = JobManager()

    class Meta:
        verbose_name = "Job"
        verbose_name_plural = "Jobs"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super().save(*args, **kwargs)
