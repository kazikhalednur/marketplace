from celery import Task, shared_task

from .mails import send_reset_mail, send_signup_verification_email
from .models import User


@shared_task
def send_reset_mail_task(user_id):
    try:
        user = User.objects.get(id=user_id)
        send_reset_mail(user)
    except User.DoesNotExist:
        pass


send_reset_mail_task: Task


@shared_task
def send_signup_verification_email_task(user_id):
    try:
        user = User.objects.get(id=user_id)
        send_signup_verification_email(user)
    except User.DoesNotExist:
        pass


send_verification_mail_task: Task
