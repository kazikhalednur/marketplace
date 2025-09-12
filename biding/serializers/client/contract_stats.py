from rest_framework import serializers


class ContractStatsSerializer(serializers.Serializer):
    """Serializer for contract statistics data"""

    total_contracts = serializers.IntegerField()
    active_contracts = serializers.IntegerField()
    completed_contracts = serializers.IntegerField()
    cancelled_contracts = serializers.IntegerField()
    total_budget = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True
    )
    average_budget = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True
    )
    contracts_this_month = serializers.IntegerField()
    contracts_this_year = serializers.IntegerField()
