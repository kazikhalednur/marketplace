from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_decode
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.views import APIView

from utils.helpers import Response

from ..models import User


@extend_schema(
    responses={
        200: inline_serializer(
            name="SignupVerifyViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="Email verified successfully. You can now login."
                )
            },
        ),
        400: inline_serializer(
            name="SignupVerifyViewResponse",
            fields={"message": drf_serializers.CharField(default="Invalid link")},
        ),
    },
)
class SignupVerifyView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, uidb64, token, *args, **kwargs):
        """
        Verify the email address of a freelancer.
        """
        user: User = self.get_user(uidb64)
        if user is None or not user.check_email_verification_token(token):
            return Response(
                status_code=400,
                message="Invalid link",
            )

        if not user.check_email_verification_timeout(token):
            user.generate_email_verification_token()
            return Response(
                status_code=400,
                message="This link has expired. A new link has been sent to your email.",  # noqa: E501
            )

        user.is_active = True
        user.email_verified = True
        user.save(update_fields=["is_active", "email_verified"])

        return Response(message="Email verified successfully. You can now login.")

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
