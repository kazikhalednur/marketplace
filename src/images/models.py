from uuid import uuid4

from django.db import models

from accounts.models import User


class Image(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, serialize=False)
    image = models.ImageField(upload_to="images/")
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="uploaded_images"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Image {self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid4()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete()
        super().delete(*args, **kwargs)
