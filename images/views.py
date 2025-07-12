from rest_framework.generics import CreateAPIView

from .models import Image
from .serializers import ImageSerializer


class ImageUploadView(CreateAPIView):
    permission_classes = []
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
