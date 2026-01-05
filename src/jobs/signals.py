import os

from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Attachment


@receiver(pre_save, sender=Attachment)
def delete_old_file_on_change(sender, instance, **kwargs):
    if not instance.pk:
        # New file, nothing to delete
        return

    try:
        old_instance = Attachment.objects.get(pk=instance.pk)
    except Attachment.DoesNotExist:
        return

    old_file = old_instance.file
    new_file = instance.file

    # Delete old file if the file has changed
    if old_file and old_file != new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)
