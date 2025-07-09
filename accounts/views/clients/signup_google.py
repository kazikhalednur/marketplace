from drf_spectacular.utils import extend_schema
from rest_framework.generics import CreateAPIView

from ...serializers.clients import SignupGoogleSerializer


@extend_schema(tags=["client"])
class SignupGoogleView(CreateAPIView):
    """
    Sign Up with Google view for clients.
    """

    authentication_classes = []
    permission_classes = []
    serializer_class = SignupGoogleSerializer
