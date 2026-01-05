from rest_framework.serializers import ModelSerializer

from work_diary.models import Milestone


class FreelancerMilestoneSerializer(ModelSerializer):
    class Meta:
        model = Milestone
        fields = (
            "number_of_steps",
            "status",
        )
