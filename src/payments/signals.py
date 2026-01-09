from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PaymentHistory, PaymentRequest, PaymentTransaction


@receiver(post_save, sender=PaymentHistory)
def payment_history_post_save(sender, instance, created, **kwargs):
    if created:
        PaymentRequest.objects.create(payment_history=instance)


@receiver(post_save, sender=PaymentRequest)
def payment_request_post_save(sender, instance, created, **kwargs):
    if created:
        PaymentTransaction.objects.create(payment_request=instance)
