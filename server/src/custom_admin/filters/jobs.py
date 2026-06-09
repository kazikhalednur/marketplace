import django_filters

from jobs.models import Attachment, Job


class JobAdminFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(
        field_name="status",
        choices=Job.JobStatus.choices,
        lookup_expr="exact",
    )
    category = django_filters.NumberFilter(field_name="category", lookup_expr="exact")
    experience_level = django_filters.ChoiceFilter(
        field_name="experience_level",
        choices=Job.JobExperienceLevel.choices,
        lookup_expr="exact",
    )
    privacy = django_filters.ChoiceFilter(
        field_name="privacy",
        choices=Job.JobPrivacy.choices,
        lookup_expr="exact",
    )
    created_by = django_filters.UUIDFilter(field_name="created_by", lookup_expr="exact")
    min_budget_gte = django_filters.NumberFilter(
        field_name="min_budget", lookup_expr="gte"
    )
    max_budget_lte = django_filters.NumberFilter(
        field_name="max_budget", lookup_expr="lte"
    )

    class Meta:
        model = Job
        fields = [
            "status",
            "category",
            "experience_level",
            "privacy",
            # "is_payment_verified",
            "created_by",
        ]


class JobAttachmentAdminFilter(django_filters.FilterSet):
    job = django_filters.UUIDFilter(field_name="job", lookup_expr="exact")

    class Meta:
        model = Attachment
        fields = ["job"]
