from django.conf import settings
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework_simplejwt.views import TokenObtainPairView

from utils.helpers import Response

from ..models import Freelancer
from ..serializers import SigninSerializer


@extend_schema(
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
        # return Response(data=serializer.data, message="Login Successfully")

        response = Response(data=serializer.data, message="Login Successfully")
        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=serializer.data["access"],
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        return response
