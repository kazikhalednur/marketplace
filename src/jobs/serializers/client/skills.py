from rest_framework import serializers

from ...models import Skill


class ClientSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "slug"]
