from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_decode
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.views import APIView

from utils.helpers import Response

from ..mails import send_signup_verification_email
from ..models import User


@extend_schema(
    responses={
        200: inline_serializer(
            name="EmailResendViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="A new verification link has been sent to your email."
                )
            },
        ),
        400: inline_serializer(
            name="EmailResendViewBadResponse",
            fields={"message": drf_serializers.CharField(default="Invalid link")},
        ),
    },
)
class EmailResendView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, uidb64, token, *args, **kwargs):
        """
        Resend verification link.
        """
        user: User = self.get_user(uidb64)
        if user is None:
            return Response(status_code=400, message="Invalid link")

        if user.email_verified:
            return Response(message="Email is already verified. You can now login.")

        if not user.check_email_verification_token(token):
            return Response(status_code=400, message="Invalid link")

        if (
            user.check_email_verification_timeout(token)
            and not user.is_resent_email
            and not user.email_verified
        ):
            send_signup_verification_email(user)
            user.is_resent_email = True
            user.save(update_fields=["is_resent_email"])
            return Response(
                message="A new verification link has been sent to your email."
            )

        return Response(message="Verification link already has been sent successfully.")

    def get_user(self, uidb64):
        try:
            # urlsafe_base64_decode() decodes to bytestring
            uid = urlsafe_base64_decode(uidb64).decode()
            pk = User._meta.pk.to_python(uid)
            user = User._default_manager.get(pk=pk)
        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist,
            ValidationError,
        ):
            user = None
        return user
