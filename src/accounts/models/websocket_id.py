from django.db import models

from .user.base import User


class WebSocketID(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="websocket"
    )
    notification_id = models.CharField(
        max_length=255, unique=True, blank=True, null=True
    )

    def __str__(self):
        return self.notification_id
