from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response

from accounts.permissions import IsClient

from ...models import Milestone, MilestoneStep


class MilestoneStepSwapView(GenericAPIView):
    """Swap the order of two milestone steps within a contract (client view)."""

    permission_classes = [IsClient]

    @extend_schema(
        tags=["client_work_diary"],
        parameters=[
            OpenApiParameter(
                name="a", description="Step number to swap", required=True, type=str
            ),
            OpenApiParameter(
                name="b", description="Step number to swap", required=True, type=str
            ),
        ],
        request=None,
        responses={
            200: inline_serializer(
                name="MilestoneStepSwapResponse",
                fields={
                    "detail": drf_serializers.CharField(
                        default="Steps swapped successfully."
                    )
                },
            )
        },
    )
    def post(self, request, *args, **kwargs):
        """Swap the step numbers of two milestone steps."""
        contract_id = self.kwargs.get("contract_id")
        a = request.data.get("a")
        b = request.data.get("b")
        if a is None or b is None:
            return Response(
                {"detail": "Provide 'a' and 'b' step numbers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone = Milestone.objects.select_related(
            "contract", "contract__client_profile"
        ).get(
            contract__id=contract_id, contract__client_profile__client=self.request.user
        )
        try:
            step_a = MilestoneStep.objects.get(milestone=milestone, step_number=a)
            step_b = MilestoneStep.objects.get(milestone=milestone, step_number=b)
        except MilestoneStep.DoesNotExist:
            return Response(
                {"detail": "One or both steps not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        step_a.step_number, step_b.step_number = step_b.step_number, step_a.step_number
        step_a.save(update_fields=["step_number"])
        step_b.save(update_fields=["step_number"])
        return Response({"detail": "Steps swapped successfully."})
