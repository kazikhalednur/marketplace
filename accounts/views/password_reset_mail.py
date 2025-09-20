from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.views import Response as drf_Response

from utils.helpers import Response

from ..models import OTP
from ..serializers import PasswordResetMailSerializer
from ..tasks import send_reset_mail_task


@extend_schema(
    tags=["password_reset"],
    responses={
        200: inline_serializer(
            name="PasswordResetMailViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="Reset Password Email already sent. Please check inbox"
                ),
            },
        ),
        202: inline_serializer(
            name="PasswordResetMailViewResponse2",
            fields={
                "message": drf_serializers.CharField(
                    default="Password reset mail was sent"
                ),
            },
        ),
    },
)
class PasswordResetMailView(APIView):
    """Password Reset Mail API"""

    authentication_classes = ()
    permission_classes = [AllowAny]
    serializer_class = PasswordResetMailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            user = serializer.get_user()
            otp, created = OTP.objects.get_or_create(user=user)
            if created:
                send_reset_mail_task.delay(user.id)

                return Response(
                    message="Password reset mail was sent",
                    status_code=status.HTTP_202_ACCEPTED,
                )
            elif otp.is_expired():
                otp.delete()
                OTP.objects.create(user=user)
                send_reset_mail_task.delay(user.id)
                return Response(
                    message="Password reset mail was resent",
                    status_code=status.HTTP_202_ACCEPTED,
                )
            else:
                return Response(
                    message="Password reset mail already sent. Please check inbox",
                )

        return drf_Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
