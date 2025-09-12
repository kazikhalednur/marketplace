from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from jobs.models import JobPayment

from .models import InitiatePayment, IPNValidatePayment
from .serializers import IPNValidatePaymentSerializer


@extend_schema(tags=["payments"], request=None)
class IPNValidatePaymentView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        data = request.data

        serializer = IPNValidatePaymentSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        tran_id = data.get("tran_id")
        if not tran_id:
            return Response(
                {"detail": "tran_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            initiate_payment = InitiatePayment.objects.get(tran_id=tran_id)
        except InitiatePayment.DoesNotExist:
            return Response(
                {"detail": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND
            )

        status_value = data.get("status", "unattempted").lower()
        status_mapping = {
            "valid": IPNValidatePayment.Status.VALID,
            "validated": IPNValidatePayment.Status.VALID,
            "failed": IPNValidatePayment.Status.FAILED,
            "cancelled": IPNValidatePayment.Status.CANCELLED,
            "expired": IPNValidatePayment.Status.EXPIRED,
            "unattempted": IPNValidatePayment.Status.UNATTEMPTED,
        }
        mapped_status = status_mapping.get(
            status_value, IPNValidatePayment.Status.UNATTEMPTED
        )

        ipn_defaults = {
            "status": mapped_status,
            "tran_id": data.get("tran_id"),
            "val_id": data.get("val_id"),
            "amount": data.get("amount") or None,
            "store_amount": data.get("store_amount") or None,
            "card_type": data.get("card_type"),
            "card_no": data.get("card_no"),
            "currency": data.get("currency"),
            "bank_tran_id": data.get("bank_tran_id"),
            "card_issuer": data.get("card_issuer"),
            "card_brand": data.get("card_brand"),
            "card_issuer_country": data.get("card_issuer_country"),
            "card_issuer_country_code": data.get("card_issuer_country_code"),
            "currency_type": data.get("currency_type"),
            "currency_amount": data.get("currency_amount") or None,
            "value_a": data.get("value_a"),
            "value_b": data.get("value_b"),
            "value_c": data.get("value_c"),
            "value_d": data.get("value_d"),
            "verify_sign": data.get("verify_sign"),
            "verify_key": data.get("verify_key"),
            "risk_level": data.get("risk_level") or None,
            "risk_title": data.get("risk_title"),
        }

        ipn_payment, created = IPNValidatePayment.objects.get_or_create(
            initiate_payment=initiate_payment,
            defaults=ipn_defaults,
        )

        if not created:
            for field, value in ipn_defaults.items():
                setattr(ipn_payment, field, value)
            ipn_payment.save()

        # Optionally update InitiatePayment status for convenience
        if mapped_status == IPNValidatePayment.Status.VALID:
            initiate_payment.status = InitiatePayment.Status.SUCCESS
            job = JobPayment.objects.get(payment=initiate_payment).job
            job.is_payment_verified = True
            job.save(update_fields=["is_payment_verified"])
        elif mapped_status in [
            IPNValidatePayment.Status.FAILED,
            IPNValidatePayment.Status.CANCELLED,
            IPNValidatePayment.Status.EXPIRED,
        ]:
            initiate_payment.status = InitiatePayment.Status.FAILED
        initiate_payment.save(update_fields=["status"])

        return Response(
            {"success": True, "message": "IPN processed", "status": mapped_status},
            status=status.HTTP_200_OK,
        )
