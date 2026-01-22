from custom_admin.serializers.base import AdminModelSerializer
from jobs.models import Attachment, Category, Job, Skill


class JobAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class CategoryAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class SkillAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class AttachmentAdminSerializer(AdminModelSerializer):
    class Meta:
        model = Attachment
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
