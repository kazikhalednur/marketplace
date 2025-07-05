from drf_spectacular.utils import extend_schema
from rest_framework.generics import CreateAPIView

from ...serializers.freelancers import SignupGoogleSerializer


@extend_schema(tags=["freelancer"])
class SignupGoogleView(CreateAPIView):
    """
    Sign Up with Google view.
    """

    authentication_classes = []
    permission_classes = []
    serializer_class = SignupGoogleSerializer
