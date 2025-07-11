from urllib.parse import urlparse

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from base.models import settings as base_settings

from .models import OTP, User


def send_reset_mail(user):
    code = OTP.objects.get(user=user).code
    subject = "Reset Password"
    from_mail = f"DIU CPC Workhub <{settings.DEFAULT_FROM_EMAIL}>"
    to_mail = user.email
    frontend_url = base_settings.FRONTEND_URL
    frontend_parsed_url = urlparse(frontend_url)
    frontend_domain = frontend_parsed_url.hostname

    text_content = render_to_string(
        "accounts/emails/password_reset.txt",
        context={"frontend_domain": frontend_domain, "code": code},
    )

    # html_content = render_to_string(
    #     "accounts/emails/password_reset.html",
    #     context={"code": code},
    # )

    msg = EmailMultiAlternatives(
        subject,
        text_content,
        from_mail,
        [to_mail],
    )

    # msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)

    return True


def send_signup_verification_email(user: User):
    subject = "Verify your email"
    from_mail = f"DIU CPC Workhub <{settings.DEFAULT_FROM_EMAIL}>"
    to_mail = user.email

    token = user.generate_email_verification_token()
    frontend_url = settings.FRONTEND_URL
    frontend_parsed_url = urlparse(frontend_url)
    frontend_domain = frontend_parsed_url.hostname
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

    text_content = render_to_string(
        "accounts/emails/email_verification.txt",
        context={
            "frontend_domain": frontend_domain,
            "frontend_url": frontend_url,
            "uidb64": uidb64,
            "token": token,
        },
    )

    # html_content = render_to_string(
    #     "accounts/emails/email_verification.html",
    #     context={
    #         "token": token,
    #         "uid64": uid64,
    #         "domain": domain,
    #         "protocol": protocol,
    #     },
    # )

    msg = EmailMultiAlternatives(
        subject,
        text_content,
        from_mail,
        [to_mail],
    )

    # msg.attach_alternative(html_content, "text/html")
    return msg.send(fail_silently=False)
