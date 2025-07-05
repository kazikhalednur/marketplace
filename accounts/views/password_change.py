from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.generics import UpdateAPIView

from utils.helpers import Response

from ..serializers import PasswordChangeSerializer


@extend_schema(
    tags=["password change"],
    responses={
        200: inline_serializer(
            name="PasswordChangeViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="Password changed successfully"
                ),
            },
        )
    },
)
class PasswordChangeView(UpdateAPIView):
    """Password Change API"""

    http_method_names = ["put"]
    serializer_class = PasswordChangeSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(message="Password changed successfully")
