from django.db import models

from accounts.models import User


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        ALERT = "alert", "Alert"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"
        INFO = "info", "Info"
        SUCCESS = "success", "Success"

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    message_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.INFO,
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:20]}..."

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
