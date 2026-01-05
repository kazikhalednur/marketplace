from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Image


@receiver(pre_save, sender=Image)
def delete_old_file_on_change(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Image.objects.get(pk=instance.pk)
            if old_instance.image != instance.image:
                old_instance.image.delete(save=False)
        except Image.DoesNotExist:
            pass
    else:
        pass
