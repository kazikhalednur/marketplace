from rest_framework import serializers

from ...models import AcceptedDomain


class AcceptedDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcceptedDomain
        fields = ["domain"]
