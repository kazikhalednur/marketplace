from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny

from ..models import Job
from ..serializers import JobSerializer


class JobDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Job.objects.published()
    serializer_class = JobSerializer
    lookup_field = "id"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
