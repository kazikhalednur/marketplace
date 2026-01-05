from rest_framework import serializers

from ...models import Category


class ClientCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]
