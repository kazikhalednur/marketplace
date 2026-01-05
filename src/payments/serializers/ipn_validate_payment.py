from rest_framework import serializers

from ..models import IPNValidatePayment


class IPNValidatePaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPNValidatePayment
        fields = [
            "status",
            "tran_date",
            "tran_id",
            "val_id",
            "amount",
            "store_amount",
            "card_type",
            "card_no",
            "currency",
            "bank_tran_id",
            "card_issuer",
            "card_brand",
            "card_issuer_country",
            "card_issuer_country_code",
            "currency_type",
            "currency_amount",
            "value_a",
            "value_b",
            "value_c",
            "value_d",
            "verify_sign",
            "verify_key",
            "risk_level",
            "risk_title",
            "created_at",
            "updated_at",
        ]
