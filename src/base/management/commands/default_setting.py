from django.core.management.base import BaseCommand

from base.models import Settings


class Command(BaseCommand):
    help = "Ensure that a singleton Settings instance exists"

    def handle(self, *args, **kwargs):
        settings, created = Settings.objects.get_or_create(pk=1)
        if created:
            self.stdout.write(self.style.SUCCESS("✅ Settings row created"))
        else:
            self.stdout.write("⚠️ Settings row already exists")
