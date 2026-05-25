from drf_spectacular.utils import extend_schema
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

from utils.helpers import Response

from ...serializers.freelancers import SignupGoogleSerializer


@extend_schema(tags=["freelancer"])
class SignupGoogleView(CreateAPIView):
    """
    Sign Up with Google view.
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = SignupGoogleSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(message="User Created Successfully")
