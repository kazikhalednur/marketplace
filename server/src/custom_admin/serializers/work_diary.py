from custom_admin.serializers.base import AdminModelSerializer
from work_diary.models import Milestone, MilestoneStep


class MilestoneAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Milestone
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class MilestoneStepAdminSerializer(AdminModelSerializer):
    class Meta:
        model = MilestoneStep
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
