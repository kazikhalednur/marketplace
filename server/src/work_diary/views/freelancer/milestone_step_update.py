from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response

from accounts.permissions import IsFreelancer

from ...models import MilestoneStep
from ...serializers.freelancer import FreelancerMilestoneStepSerializer


@extend_schema(tags=["freelancer_work_diary"])
@extend_schema_view(
    update=extend_schema(
        summary="Update a milestone step",
        description="Update a milestone step",
    ),
)
class MilestoneStepUpdateView(UpdateAPIView):
    """Update a milestone step submission (freelancer view)."""

    serializer_class = FreelancerMilestoneStepSerializer
    permission_classes = [IsFreelancer]
    lookup_field = "id"
    lookup_url_kwarg = "step_id"
    http_method_names = ["patch"]

    def get_queryset(self):
        return MilestoneStep.objects.filter(
            milestone__contract__id=self.kwargs.get("contract_id"),
            milestone__contract__freelancer_profile__freelancer__id=self.request.user.id,  # noqa: E501
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["contract_id"] = self.kwargs.get("contract_id")
        return context

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(
            {"message": "File Uploaded successfully"}, status=status.HTTP_200_OK
        )
