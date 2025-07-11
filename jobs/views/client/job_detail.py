from drf_spectacular.utils import extend_schema
from rest_framework.generics import RetrieveUpdateDestroyAPIView

from accounts.permissions import IsClient

from ...models import Job
from ...serializers.client import ClientJobSerializer


@extend_schema(tags=["Client Jobs"])
class JobDetailView(RetrieveUpdateDestroyAPIView):
    http_method_names = ["get", "patch", "delete"]
    permission_classes = [IsClient]
    serializer_class = ClientJobSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user)
