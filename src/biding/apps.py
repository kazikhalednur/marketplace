from django.apps import AppConfig


class BidingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "biding"

    def ready(self):
        from . import signals  # noqa: F401
