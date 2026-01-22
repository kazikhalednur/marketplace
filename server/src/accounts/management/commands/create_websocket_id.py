from django.core.management.base import BaseCommand

from ...models import User, WebSocketID


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        for user in User.objects.all():
            if not hasattr(user, "websocket"):
                WebSocketID.objects.create(user=user)
                self.stdout.write(
                    self.style.SUCCESS(f"WebSocketID created for user {user.id}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"WebSocketID already exists for user {user.id}")
                )
        self.stdout.write(self.style.SUCCESS("WebSocketID creation check completed"))
