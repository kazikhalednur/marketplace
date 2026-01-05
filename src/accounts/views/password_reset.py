from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from utils.helpers import Response

from ..serializers import PasswordResetSerializer


@extend_schema(
    tags=["password_reset"],
    responses={
        200: inline_serializer(
            name="PasswordResetViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="Password reset successfully"
                ),
            },
        )
    },
)
class PasswordResetView(CreateAPIView):
    """Password Reset API"""

    authentication_classes = ()
    permission_classes = [AllowAny]
    serializer_class = PasswordResetSerializer

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(message="Password reset successfully")
