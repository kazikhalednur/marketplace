from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from work_diary.models import Milestone, MilestoneStep


class ClientMilestoneSerializer(ModelSerializer):
    accepted = serializers.SerializerMethodField()
    pending = serializers.SerializerMethodField()
    submitted = serializers.SerializerMethodField()
    in_review = serializers.SerializerMethodField()
    rejected = serializers.SerializerMethodField()
    paid = serializers.SerializerMethodField()

    class Meta:
        model = Milestone
        fields = (
            "id",
            "contract",
            "number_of_steps",
            "status",
            "accepted",
            "pending",
            "submitted",
            "in_review",
            "rejected",
            "paid",
        )
        read_only_fields = ("id",)

    @extend_schema_field(serializers.IntegerField())
    def get_accepted(self, obj):
        return obj.steps.filter(status=MilestoneStep.Status.ACCEPTED).count()

    @extend_schema_field(serializers.IntegerField())
    def get_pending(self, obj):
        return obj.steps.filter(status=MilestoneStep.Status.PENDING).count()

    @extend_schema_field(serializers.IntegerField())
    def get_submitted(self, obj):
        return obj.steps.filter(status=MilestoneStep.Status.SUBMITTED).count()

    @extend_schema_field(serializers.IntegerField())
    def get_in_review(self, obj):
        return obj.steps.filter(status=MilestoneStep.Status.IN_REVIEW).count()

    @extend_schema_field(serializers.IntegerField())
    def get_rejected(self, obj):
        return obj.steps.filter(status=MilestoneStep.Status.REJECTED).count()

    @extend_schema_field(serializers.IntegerField())
    def get_paid(self, obj):
        return obj.steps.filter(status=MilestoneStep.Status.PAID).count()
