from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import PaymentCallbackLog, PaymentRequest
from ..utils import PaymentUtility


class CallbackPaymentView(APIView):
    permission_classes = []
    serializer_class = None

    def get(self, request):

        status = request.GET.get("status")
        invoice_number = request.GET.get("invoice_number")
        trx_id = request.GET.get("trx_id")
        message = request.GET.get("message")
        payment_request = PaymentRequest.objects.get(invoice_number=invoice_number)

        PaymentCallbackLog.objects.get_or_create(
            payment_request=payment_request,
            defaults={
                "status": status.upper(),
                "message": message,
                "trx_id": trx_id,
            },
        )
        payment_utility = PaymentUtility(request, payment_request.payment_history)
        payment_utility.handle_payment_callback()

        return Response()
