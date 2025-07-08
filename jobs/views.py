from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Category, Job
from .serializers import CategorySerializer, JobSerializer


class JobListView(ListAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer


class CategoryListView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class JobDetailView(RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    lookup_field = "id"


class CategoryDetailView(RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "id"
