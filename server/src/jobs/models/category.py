from django.db import models
from simple_history.models import HistoricalRecords

from utils.slugify import generate_unique_slug


class Category(models.Model):
    name = models.CharField(
        max_length=100, unique=True, help_text="Name of the category"
    )
    slug = models.SlugField(
        blank=True,
        max_length=100,
        unique=True,
        help_text="URL-friendly version of the category name",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name, slug_field_name="slug")
        super(Category, self).save(*args, **kwargs)
