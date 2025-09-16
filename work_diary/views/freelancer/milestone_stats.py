from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from accounts.permissions import IsFreelancer

from ...models import Milestone, MilestoneStep

StatsSerializer = inline_serializer(
    name="MilestoneStatsSerializer",
    fields={
        "milestone_id": drf_serializers.UUIDField(),
        "status": drf_serializers.CharField(),
        "number_of_steps": drf_serializers.IntegerField(),
        "total_steps": drf_serializers.IntegerField(),
        "accepted": drf_serializers.IntegerField(),
        "pending": drf_serializers.IntegerField(),
        "submitted": drf_serializers.IntegerField(),
        "in_review": drf_serializers.IntegerField(),
        "failed": drf_serializers.IntegerField(),
        "paid": drf_serializers.IntegerField(),
    },
)


@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve milestone stats",
        description="Counts of steps by status for a milestone",
        tags=["freelancer_work_diary"],
        responses={200: StatsSerializer},
    ),
)
class MilestoneStatsView(RetrieveAPIView):
    """Return counts of steps by status for a milestone (freelancer view)."""

    permission_classes = [IsFreelancer]
    lookup_field = "contract__id"
    lookup_url_kwarg = "contract_id"

    def get_queryset(self):
        user = self.request.user
        return Milestone.objects.select_related(
            "contract",
            "contract__freelancer_profile",
            "contract__freelancer_profile__freelancer",
        ).filter(contract__freelancer_profile__freelancer=user)

    def retrieve(self, request, *args, **kwargs):
        milestone = self.get_queryset().get(contract__id=kwargs.get("contract_id"))

        steps = milestone.steps
        total_steps = steps.count()

        aggregates = steps.aggregate(
            accepted=Count("id", filter=Q(status=MilestoneStep.Status.ACCEPTED)),
            pending=Count("id", filter=Q(status=MilestoneStep.Status.PENDING)),
            submitted=Count("id", filter=Q(status=MilestoneStep.Status.SUBMITTED)),
            in_review=Count("id", filter=Q(status=MilestoneStep.Status.IN_REVIEW)),
            failed=Count("id", filter=Q(status=MilestoneStep.Status.FAILED)),
            paid=Count("id", filter=Q(status=MilestoneStep.Status.PAID)),
        )

        data = {
            "milestone_id": milestone.id,
            "status": milestone.status,
            "number_of_steps": milestone.number_of_steps,
            "total_steps": total_steps,
            **{k: int(v or 0) for k, v in aggregates.items()},
        }
        return Response(data)
