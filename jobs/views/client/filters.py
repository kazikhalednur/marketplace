import django_filters

from ...models import Job


class ClientJobFilter(django_filters.FilterSet):
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
    min_hourly_rate = django_filters.NumberFilter(
        field_name="min_hourly_rate", lookup_expr="gte"
    )
    max_hourly_rate = django_filters.NumberFilter(
        field_name="max_hourly_rate", lookup_expr="lte"
    )
    skills = django_filters.CharFilter(
        field_name="skills__name", lookup_expr="icontains"
    )
    tags = django_filters.CharFilter(field_name="tags__name", lookup_expr="icontains")

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
        ]
        order_by = ["created_at", "updated_at"]
