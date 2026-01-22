from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from utils.helpers import Response

from ...serializers.clients import ClientSignupSerializer


@extend_schema(
    tags=["client"],
    responses={
        200: inline_serializer(
            name="ClientSignupViewResponse",
            fields={
                "message": drf_serializers.CharField(
                    default="User Created Successfully"
                )
            },
        ),
    },
)
class SignupView(CreateAPIView):
    """Signup API"""

    authentication_classes = ()
    permission_classes = [AllowAny]
    serializer_class = ClientSignupSerializer

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(message="User Created Successfully")
