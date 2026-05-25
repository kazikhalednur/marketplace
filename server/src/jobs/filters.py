import django_filters
from django.db.models import Q

from .models import Job


class JobFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(
        field_name="status",
        choices=Job.JobStatus.choices,
        lookup_expr="exact",
    )
    category = django_filters.CharFilter(
        field_name="category__name", lookup_expr="icontains"
    )
    experience_level = django_filters.ChoiceFilter(
        field_name="experience_level",
        choices=Job.JobExperienceLevel.choices,
        lookup_expr="exact",
    )
    min_budget = django_filters.NumberFilter(field_name="min_budget", lookup_expr="gte")
    max_budget = django_filters.NumberFilter(field_name="max_budget", lookup_expr="lte")
    skills = django_filters.CharFilter(
        field_name="skills__name", lookup_expr="icontains"
    )
    tags = django_filters.CharFilter(field_name="tags", lookup_expr="icontains")
    search = django_filters.CharFilter(method="filter_search")

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset

        return queryset.filter(
            Q(title__icontains=value)
            | Q(description__icontains=value)
            | Q(tags__icontains=value)
            | Q(category__name__icontains=value)
            | Q(skills__name__icontains=value)
            | Q(experience_level__icontains=value)
        ).distinct()

    class Meta:
        model = Job
        fields = [
            "status",
            "category",
            "experience_level",
            "min_budget",
            "max_budget",
            "min_hourly_rate",
            "max_hourly_rate",
            "skills",
            "tags",
            "search",
        ]
        order_by = ["created_at", "updated_at"]
