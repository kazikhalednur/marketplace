from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsClient
from jobs.models import JobPayment
from payments.utils import PaymentUtility

from ...models import Job


@extend_schema(tags=["client_jobs"], request=None)
class JobPaymentView(APIView):
    permission_classes = [IsClient]

    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, created_by=request.user)
        except Job.DoesNotExist:
            return Response(
                {"detail": "Job not found or not owned by you."},
                status=status.HTTP_404_NOT_FOUND,
            )

        amount = float(job.max_budget)
        currency = "BDT"

        utility = PaymentUtility()
        result = utility.initiate_payment(request, request.user, amount, currency)
        JobPayment.objects.create(job=job, payment=result.get("payment"))

        if not result.get("success"):
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_200_OK)
