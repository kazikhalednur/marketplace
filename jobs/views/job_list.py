from rest_framework.generics import ListAPIView

from ..models import Job
from ..serializers import JobSerializer


class JobListView(ListAPIView):
    permission_classes = []
    queryset = Job.objects.published()
    serializer_class = JobSerializer
