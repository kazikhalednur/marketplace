from rest_framework.generics import ListAPIView

from ..models import Category
from ..serializers import CategorySkillSerializer


class CategorySkillListView(ListAPIView):
    permission_classes = []
    queryset = Category.objects.all()
    serializer_class = CategorySkillSerializer
