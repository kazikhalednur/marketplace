from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework.generics import RetrieveUpdateAPIView

from accounts.models import ClientProfile
from accounts.permissions import IsClient
from biding.models import Contract
from biding.serializers.client import ClientContractDetailSerializer
from utils.helpers import Response


@extend_schema(tags=["client_contracts"])
class ContractDetailView(RetrieveUpdateAPIView):
    """
    Retrieve a specific contract for the authenticated client.
    """

    serializer_class = ClientContractDetailSerializer
    permission_classes = [IsClient]
    http_method_names = ["get", "patch"]
    lookup_field = "id"
    lookup_url_kwarg = "contract_id"

    def get_queryset(self):
        try:
            client_profile = ClientProfile.objects.get(client=self.request.user)
            return Contract.objects.filter(
                client_profile=client_profile
            ).select_related("job", "freelancer_profile", "freelancer_sub_profile")
        except ClientProfile.DoesNotExist:
            return Contract.objects.none()

    @extend_schema(
        responses={
            200: inline_serializer(
                name="ContractDetailViewUpdateResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="Contract updated successfully"
                    )
                },
            ),
        },
    )
    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(status_code=200, message="Contract updated successfully.")
