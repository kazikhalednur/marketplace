import django_filters

from work_diary.models import Milestone, MilestoneStep


class MilestoneAdminFilter(django_filters.FilterSet):
    contract = django_filters.UUIDFilter(field_name="contract", lookup_expr="exact")

    class Meta:
        model = Milestone
        fields = ["contract"]


class MilestoneStepAdminFilter(django_filters.FilterSet):
    milestone = django_filters.UUIDFilter(field_name="milestone", lookup_expr="exact")

    class Meta:
        model = MilestoneStep
        fields = ["milestone"]
