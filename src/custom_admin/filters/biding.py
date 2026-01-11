import django_filters

from biding.models import Attachment, Contract, Proposal


class ProposalAdminFilter(django_filters.FilterSet):
    job = django_filters.UUIDFilter(field_name="job", lookup_expr="exact")

    class Meta:
        model = Proposal
        fields = ["job"]


class ContractAdminFilter(django_filters.FilterSet):
    job = django_filters.UUIDFilter(field_name="job", lookup_expr="exact")

    class Meta:
        model = Contract
        fields = ["job"]


class BidingAttachmentAdminFilter(django_filters.FilterSet):
    proposal = django_filters.UUIDFilter(field_name="proposal", lookup_expr="exact")

    class Meta:
        model = Attachment
        fields = ["proposal"]
