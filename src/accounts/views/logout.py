from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework_simplejwt.views import TokenBlacklistView

from utils.helpers import Response


@extend_schema(
    summary="Logout",
    responses={
        200: inline_serializer(
            name="LogoutViewResponse",
            fields={
                "message": drf_serializers.CharField(default="Logout successfully")
            },
        ),
    },
)
class LogoutView(TokenBlacklistView):
    """Takes refresh token and add it in blacklist"""

    def post(self, request, *args, **kwargs):
        super().post(request, *args, **kwargs)
        return Response(message="Logout Successfully")
