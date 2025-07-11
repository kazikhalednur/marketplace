from django.db import connection
from django.db.models.signals import post_migrate
from django.db.utils import OperationalError, ProgrammingError
from django.dispatch import receiver

from .models import Settings


@receiver(post_migrate)
def create_settings_row(sender, **kwargs):
    try:
        # Only proceed if the table exists
        if "base_settings" in connection.introspection.table_names():
            Settings.objects.get_or_create(pk=1)
    except (OperationalError, ProgrammingError):
        # If DB is not ready or table missing, ignore and wait for next migration
        pass
