from rest_framework.generics import CreateAPIView, DestroyAPIView
from rest_framework.parsers import MultiPartParser

from .models import Image
from .serializers import ImageSerializer


class ImageUploadView(CreateAPIView):
    parser_classes = [MultiPartParser]
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ImageDeleteView(DestroyAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    lookup_field = "id"
