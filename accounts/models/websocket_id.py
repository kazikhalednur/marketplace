from uuid import uuid4

from django.db import models

from .user.base import User


class WebSocketID(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="websocket"
    )
    notication_id = models.CharField(max_length=255, unique=True, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.notication_id:
            self.notication_id = "".join(str(uuid4()).split("-")).upper()[:10]
        super(WebSocketID, self).save(*args, **kwargs)
