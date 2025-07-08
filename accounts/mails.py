from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .models import OTP, User


def send_reset_mail(user):
    code = OTP.objects.get(user=user).code
    subject = "Reset Password"
    from_mail = f"DIU CPC Workhub <{settings.DEFAULT_FROM_EMAIL}>"
    to_mail = user.email

    text_content = render_to_string(
        "accounts/emails/password_reset.txt",
        context={"code": code},
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


def send_signup_verification_email(user: User, request):
    subject = "Verify your email"
    from_mail = f"DIU CPC Workhub <{settings.DEFAULT_FROM_EMAIL}>"
    to_mail = user.email

    token = user.generate_email_verification_token()
    current_site = get_current_site(request)
    domain = current_site.domain
    uid64 = urlsafe_base64_encode(force_bytes(user.pk))
    protocol = "https" if request.is_secure() else "http"

    text_content = render_to_string(
        "accounts/emails/signup_verification.txt",
        context={
            "token": token,
            "uid64": uid64,
            "domain": domain,
            "protocol": protocol,
        },
    )

    # html_content = render_to_string(
    #     "accounts/emails/signup_verification.html",
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
