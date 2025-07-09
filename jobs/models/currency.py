from django.db import models
from simple_history.models import HistoricalRecords


class Currency(models.Model):
    name = models.CharField(
        max_length=100, unique=True, help_text="Name of the category"
    )
    symbol = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Symbol of the currency, e.g., $, €, £",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} ({self.symbol})" if self.symbol else self.name

    class Meta:
        verbose_name = "Currency"
        verbose_name_plural = "Currencies"
        ordering = ["name"]
