from django.db import models
from simple_history.models import HistoricalRecords


class AcceptedDomainManager(models.Manager):
    """
    Custom manager for AcceptedDomain model to handle domain-related queries.
    """

    def active_domains(self):
        """
        Returns all active accepted domains.
        """
        return self.filter(is_active=True)

    def inactive_domains(self):
        """
        Returns all inactive accepted domains.
        """
        return self.filter(is_active=False)


class AcceptedDomain(models.Model):
    """
    Model to store accepted email domains for user registration.
    """

    domain = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(
        default=True, help_text="Indicates if the domain is currently accepted"
    )
    notes = models.TextField(
        blank=True, null=True, help_text="Additional notes about the domain"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    objects = AcceptedDomainManager()

    def __str__(self):
        return self.domain

    class Meta:
        verbose_name = "Accepted Domain"
        verbose_name_plural = "Accepted Domains"
        ordering = ["domain"]
