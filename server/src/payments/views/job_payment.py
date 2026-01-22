from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import PaymentHistory
from ..serializers import JobPaymentResponseSerializer, JobPaymentSerializer
from ..utils import PaymentUtility


@extend_schema(tags=["payments"], responses={200: JobPaymentResponseSerializer})
class JobPaymentView(APIView):
    serializer_class = JobPaymentSerializer

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        job = serializer.validated_data.get("job_id")

        payment_history = PaymentHistory.objects.create(
            user=request.user,
            job=job,
            amount=job.min_budget,
        )
        payment_utility = PaymentUtility(request, payment_history)
        response = payment_utility.initiate_payment()

        return Response(response, status=response.get("status_code"))
