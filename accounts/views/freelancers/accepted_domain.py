from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView

from ...models import AcceptedDomain
from ...serializers.freelancers import AcceptedDomainSerializer


@extend_schema(tags=["freelancer"])
class AcceptedDomainView(ListAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = AcceptedDomainSerializer

    def get_queryset(self):
        """
        Returns a queryset of accepted domains.
        """
        return AcceptedDomain.objects.active_domains()
