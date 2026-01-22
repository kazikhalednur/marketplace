from rest_framework import serializers


class ClientMilestoneStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField(read_only=True)
    active = serializers.IntegerField(read_only=True)
    completed = serializers.IntegerField(read_only=True)
    total_paid = serializers.IntegerField(read_only=True)
