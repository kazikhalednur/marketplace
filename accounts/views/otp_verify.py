from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from utils.helpers import Response

from ..serializers import OTPVerifySerializer


@extend_schema(
    tags=["password reset"],
    responses={
        200: inline_serializer(
            name="OTPVerifyResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="OTP verified successfully"
                ),
            },
        )
    },
)
class OTPVerifyView(CreateAPIView):
    """OTP Verify API"""

    authentication_classes = ()
    permission_classes = [AllowAny]
    serializer_class = OTPVerifySerializer

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(message="OTP verified successfully")
