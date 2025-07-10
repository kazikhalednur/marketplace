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
            name="EmailVerifyViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="Email verified successfully. You can now login."
                )
            },
        ),
        400: inline_serializer(
            name="EmailVerifyViewBadResponse",
            fields={"message": drf_serializers.CharField(default="Invalid link")},
        ),
    },
)
class EmailVerifyView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, uidb64, token, *args, **kwargs):
        """
        Verify the email address.
        """
        user: User = self.get_user(uidb64)
        if user is None or not user.check_email_verification_token(token):
            return Response(
                status_code=400,
                message="Invalid link",
                data={"is_success": False, "is_expired": False, "is_invalid": True},
            )

        if user.check_email_verification_timeout(token):
            return Response(
                message="This link has expired. Please request a new verification link.",  # noqa: E501
                data={"is_success": False, "is_expired": True, "is_invalid": False},
            )

        user.is_active = True
        user.email_verified = True
        user.save(update_fields=["is_active", "email_verified"])

        return Response(
            message="Email verified successfully. You can now login.",
            data={"is_success": True, "is_expired": False, "is_invalid": False},
        )

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
