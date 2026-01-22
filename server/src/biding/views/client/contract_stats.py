from decimal import Decimal

from django.db.models import Avg, Count, Sum
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView

from accounts.models import ClientProfile
from accounts.permissions import IsClient
from biding.models import Contract
from biding.serializers.client import ContractStatsSerializer
from utils.helpers import Response


@extend_schema(tags=["client_contracts"])
class ContractStatsListView(APIView):
    """
    Get contract statistics for the authenticated client.
    """

    permission_classes = [IsClient]
    serializer_class = ContractStatsSerializer

    def get(self, request):
        """Get contract statistics for the authenticated client"""
        try:
            client_profile = ClientProfile.objects.get(client=request.user)
            contracts = Contract.objects.filter(client_profile=client_profile)

            # Get current date for filtering
            now = timezone.now()
            current_month = now.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            current_year = now.replace(
                month=1, day=1, hour=0, minute=0, second=0, microsecond=0
            )

            # Calculate statistics
            total_contracts = contracts.count()

            # Count by status
            status_counts = contracts.values("status").annotate(count=Count("id"))
            status_dict = {item["status"]: item["count"] for item in status_counts}

            active_contracts = status_dict.get(Contract.ContractStatus.ACTIVE, 0)
            completed_contracts = status_dict.get(Contract.ContractStatus.COMPLETED, 0)
            cancelled_contracts = status_dict.get(Contract.ContractStatus.CANCELLED, 0)

            # Budget calculations
            budget_aggregates = contracts.aggregate(
                total_budget=Sum("budget"), average_budget=Avg("budget")
            )

            total_budget = budget_aggregates["total_budget"] or Decimal("0.00")
            average_budget = budget_aggregates["average_budget"] or Decimal("0.00")

            # Time-based counts
            contracts_this_month = contracts.filter(
                start_date__gte=current_month
            ).count()
            contracts_this_year = contracts.filter(start_date__gte=current_year).count()

            # Prepare stats data
            stats_data = {
                "total_contracts": total_contracts,
                "active_contracts": active_contracts,
                "completed_contracts": completed_contracts,
                "cancelled_contracts": cancelled_contracts,
                "total_budget": total_budget,
                "average_budget": average_budget,
                "contracts_this_month": contracts_this_month,
                "contracts_this_year": contracts_this_year,
            }

            # Serialize the data
            serializer = self.get_serializer(stats_data)

            return Response(
                status_code=200,
                message="Contract statistics retrieved successfully",
                data=serializer.data,
            )

        except ClientProfile.DoesNotExist:
            return Response(
                status_code=404, message="Client profile not found", data={}
            )
        except Exception as e:
            return Response(
                status_code=500,
                message=f"Error retrieving contract statistics: {str(e)}",
                data={},
            )
