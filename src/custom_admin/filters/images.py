import django_filters

from images.models import Image


class ImageAdminFilter(django_filters.FilterSet):
    uploaded_by = django_filters.UUIDFilter(
        field_name="uploaded_by", lookup_expr="exact"
    )

    class Meta:
        model = Image
        fields = ["uploaded_by"]
