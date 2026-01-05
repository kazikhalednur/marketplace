from uuid import uuid4

from django.db import models

from .user.base import User


class WebSocketID(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="websocket"
    )
    notification_id = models.CharField(
        max_length=255, unique=True, blank=True, null=True
    )

    def save(self, *args, **kwargs):
        if not self.notification_id:
            self.notification_id = "".join(str(uuid4()).split("-")).upper()
        super(WebSocketID, self).save(*args, **kwargs)
