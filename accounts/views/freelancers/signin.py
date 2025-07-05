from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework_simplejwt.views import TokenObtainPairView

from utils.helpers import Response

from ...models import Freelancer
from ...serializers.freelancers import SigninSerializer


@extend_schema(
    tags=["freelancer"],
    responses={
        200: inline_serializer(
            name="LoginViewResponse",
            fields={
                "message": drf_serializers.CharField(default="Login Successfully"),
                "access": drf_serializers.CharField(),
                "refresh": drf_serializers.CharField(),
            },
        ),
    },
)
class SigninView(TokenObtainPairView):
    serializer_class = SigninSerializer
    queryset = Freelancer.objects.all()

    def post(self, request, *args, **kwargs):
        serializer = super().post(request, *args, **kwargs)
        return Response(data=serializer.data, message="Login Successfully")
