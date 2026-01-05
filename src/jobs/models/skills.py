from django.db import models
from simple_history.models import HistoricalRecords

from utils.slugify import generate_unique_slug

from .category import Category


class Skill(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="skills",
        help_text="Category to which the skill belongs",
    )
    name = models.CharField(max_length=100, unique=True, help_text="Name of the skill")
    slug = models.SlugField(
        blank=True,
        max_length=100,
        unique=True,
        help_text="URL-friendly version of the skill name",
    )
    description = models.TextField(
        blank=True, null=True, help_text="Description of the skill"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name, slug_field_name="slug")
        super(Skill, self).save(*args, **kwargs)
