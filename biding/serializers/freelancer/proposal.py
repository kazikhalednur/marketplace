from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from base.models import Settings as base_settings
from jobs.models import Job

from ...models import Attachment, Proposal
from .attachment import AttachmentSerializer


class ProposalSerializer(serializers.ModelSerializer):
    attachments = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all())
    status = serializers.ChoiceField(
        choices=Proposal.BidStatus.choices,
        default=Proposal.BidStatus.PENDING,
        read_only=True,
    )
    uploaded_attachments = AttachmentSerializer(
        many=True, read_only=True, source="attachments.all"
    )
    job_link = serializers.SerializerMethodField()
    bid_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Proposal
        fields = (
            "id",
            "job",
            "job_link",
            "cover_letter",
            "bid_amount",
            "status",
            "submitted_at",
            "attachments",
            "uploaded_attachments",
        )

    def create(self, validated_data):
        attachments = validated_data.pop("attachments", [])
        proposal = Proposal.objects.create(**validated_data)

        for file in attachments:
            Attachment.objects.create(proposal=proposal, file=file)

        return proposal

    def delete(self, instance):
        if instance.status != Proposal.BidStatus.PENDING:
            raise serializers.ValidationError(
                {"status": "Only pending proposals can be deleted."}
            )

        super().delete(instance)

    @extend_schema_field(serializers.URLField)
    def get_job_link(self, obj):
        frontend_url = base_settings.FRONTEND_URL
        return f"{frontend_url}/dashboard?jobId={obj.job.id}/"

    def validate(self, attrs):
        if "job" not in attrs:
            raise serializers.ValidationError({"job": "This field is required."})

        if attrs["job"].status != Job.JobStatus.OPEN:
            raise serializers.ValidationError(
                {"job": "The job must be open to submit a proposal."}
            )

        if attrs["job"].is_fixed:
            attrs["bid_amount"] = attrs["job"].min_budget

        if attrs["bid_amount"] < attrs["job"].min_budget:
            raise serializers.ValidationError(
                {
                    "bid_amount": f"Bid amount cannot be less than the job's minimum budget of {attrs['job'].min_budget}."  # noqa: E501
                }
            )
        if attrs["bid_amount"] > attrs["job"].max_budget:
            raise serializers.ValidationError(
                {
                    "bid_amount": f"Bid amount cannot exceed the job's maximum budget of {attrs['job'].max_budget}."  # noqa: E501
                }
            )

        return super().validate(attrs)
