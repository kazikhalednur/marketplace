from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework_simplejwt.views import TokenVerifyView as JWTTokenVerifyView

from utils.helpers import Response


@extend_schema(
    summary="Verify JWT Token",
    responses={
        200: inline_serializer(
            name="TokenVerifyViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="Token Verified Successfully"
                ),
            },
        ),
    },
)
class TokenVerifyView(JWTTokenVerifyView):
    def post(self, request, *args, **kwargs):
        serializer = super().post(request, *args, **kwargs)
        return Response(data=serializer.data, message="Token Verified Successfully")
