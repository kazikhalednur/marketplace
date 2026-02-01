from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import (
    PaymentCallbackLog,
    PaymentHistory,
    PaymentRequest,
    PaymentTransaction,
)


@receiver(post_save, sender=PaymentHistory)
def payment_history_post_save(sender, instance, created, **kwargs):
    if created:
        PaymentRequest.objects.create(payment_history=instance)


@receiver(post_save, sender=PaymentRequest)
def payment_request_post_save(sender, instance, created, **kwargs):
    if created:
        PaymentTransaction.objects.create(payment_request=instance)


@receiver(post_save, sender=PaymentTransaction)
def payment_transaction_post_save(sender, instance, created, **kwargs):
    instance.payment_request.payment_history.status = instance.trx_status
    instance.payment_request.payment_history.save(update_fields=["status"])


@receiver(post_save, sender=PaymentCallbackLog)
def payment_callback_log_post_save(
    sender, instance: PaymentCallbackLog, created, **kwargs
):
    instance.payment_request.transaction.trx_status = instance.status
    instance.payment_request.transaction.save(update_fields=["trx_status"])

    if instance.status == "SUCCESSFUL":
        instance.payment_request.payment_history.job.is_payment_verified = True
        instance.payment_request.payment_history.job.save(
            update_fields=["is_payment_verified"]
        )
