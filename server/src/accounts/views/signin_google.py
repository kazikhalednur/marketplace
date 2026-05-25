from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from utils.helpers import Response

from ..serializers import SigninGoogleSerializer


@extend_schema(
    responses={
        200: inline_serializer(
            name="SigninGoogleViewResponse",
            fields={
                "message": drf_serializers.CharField(default="Login Successfully"),
                "access": drf_serializers.CharField(),
                "refresh": drf_serializers.CharField(),
                "role": drf_serializers.CharField(),
            },
        ),
    },
)
class SigninGoogleView(APIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = SigninGoogleSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(data=serializer.data, message="Login Successfully")
