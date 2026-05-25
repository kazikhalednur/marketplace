from drf_spectacular.utils import extend_schema
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from utils.helpers import Response

from ...serializers.clients import ClientSignupGoogleSerializer


@extend_schema(tags=["client"])
class SignupGoogleView(CreateAPIView):
    """
    Sign Up with Google view for clients.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = ClientSignupGoogleSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            message="Registration successful",
            data={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
            },
        )
