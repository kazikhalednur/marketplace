from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView

from accounts.permissions import IsClient

from ...models import Job
from ...serializers.client import ClientJobSerializer


@extend_schema(tags=["Client Jobs"])
class JobListView(ListAPIView):
    permission_classes = [IsClient]
    serializer_class = ClientJobSerializer

    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user)
