from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsClient
from work_diary.models import Milestone, MilestoneStep
from work_diary.serializers.client import ClientMilestoneStatsSerializer


@extend_schema(
    tags=["client_work_diary"],
    summary="Milestone stats for client",
    description=(
        "Return totals for the authenticated client's contracts: total milestones, "
        "active milestones, completed milestones, and count of paid steps."
    ),
    responses={200: ClientMilestoneStatsSerializer},
)
class MilestoneStatsView(APIView):
    permission_classes = [IsAuthenticated, IsClient]
    serializer_class = ClientMilestoneStatsSerializer

    def get(self, request):
        user = request.user

        milestones = Milestone.objects.filter(contract__client_profile__client=user)

        aggregates = milestones.aggregate(
            total=Count("id", distinct=True),
            active=Count("id", filter=Q(status=Milestone.Status.ACTIVE), distinct=True),
            completed=Count(
                "id", filter=Q(status=Milestone.Status.COMPLETED), distinct=True
            ),
        )

        total_paid = MilestoneStep.objects.filter(
            milestone__contract__client_profile__client=user,
            status=MilestoneStep.Status.PAID,
        ).count()

        data = {
            "total": aggregates.get("total", 0) or 0,
            "active": aggregates.get("active", 0) or 0,
            "completed": aggregates.get("completed", 0) or 0,
            "total_paid": total_paid,
        }

        serializer = ClientMilestoneStatsSerializer(data)
        return Response(serializer.data)
