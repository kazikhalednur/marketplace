from django.apps import AppConfig


class WorkDiaryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "work_diary"

    def ready(self):
        from . import signals  # noqa: F401
