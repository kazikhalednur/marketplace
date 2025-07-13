from rest_framework.generics import RetrieveAPIView

from ..models import Job
from ..serializers import JobSerializer


class JobDetailView(RetrieveAPIView):
    permission_classes = []
    authentication_classes = []
    queryset = Job.objects.published()
    serializer_class = JobSerializer
    lookup_field = "id"
