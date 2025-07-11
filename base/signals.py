from django.db import connection
from django.db.models.signals import post_migrate
from django.db.utils import OperationalError
from django.dispatch import receiver

from .models import Settings


@receiver(post_migrate)
def create_settings_row(sender, **kwargs):
    try:
        if "base_settings" in connection.introspection.table_names():
            Settings.get_data()
    except OperationalError:
        pass
