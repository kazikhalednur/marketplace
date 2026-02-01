from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import PaymentRequest


@extend_schema(
    tags=["payments"],
    responses={
        200: inline_serializer(
            name="StatusByInvoiceNumberViewResponse",
            fields={"status": drf_serializers.CharField(default="success")},
        )
    },
)
class StatusByInvoiceNumberView(APIView):
    def get(self, request, invoice_number):
        try:
            payment_request = PaymentRequest.objects.get(invoice_number=invoice_number)
            data = {"status": payment_request.transaction.trx_status}
            return Response({"data": data}, status=status.HTTP_200_OK)
        except PaymentRequest.DoesNotExist:
            return Response(
                {"message": "Invoice number not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
