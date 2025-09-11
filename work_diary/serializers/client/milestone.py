from rest_framework.serializers import ModelSerializer

from work_diary.models import Milestone


class ClientMilestoneSerializer(ModelSerializer):
    class Meta:
        model = Milestone
        fields = (
            "id",
            "contract",
            "number_of_steps",
            "status",
        )
        read_only_fields = ("id",)
