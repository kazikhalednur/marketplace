from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from biding.models import Contract
from work_diary.models import Milestone, MilestoneStep


class ClientMilestoneStepSerializer(ModelSerializer):
    class Meta:
        model = MilestoneStep
        fields = (
            "id",
            "step_number",
            "title",
            "description",
            "amount",
            "start_date",
            "due_date",
            "message",
            "code_zip",
            "uploaded_at",
            "status",
        )
        read_only_fields = ("id", "step_number", "uploaded_at", "code_zip", "message")

    def validate(self, attrs):
        if self.context.get("contract_id"):
            try:
                contract: Contract = Contract.objects.get(
                    id=self.context.get("contract_id")
                )
                if contract.status == Contract.ContractStatus.COMPLETED:
                    raise serializers.ValidationError(
                        {"contract": "Cannot modify a completed contract."}
                    )
            except Contract.DoesNotExist:
                raise serializers.ValidationError(
                    {"detail": "No Contract matches the given query."}
                )

        if attrs.get("start_date") and attrs.get("start_date") < timezone.now().date():
            raise serializers.ValidationError(
                {"start_date": "Start date cannot be in the past"}
            )

        if attrs.get("due_date") and attrs.get("due_date") < attrs.get("start_date"):
            raise serializers.ValidationError(
                {"due_date": "Due date must be greater than start date"}
            )

        if attrs.get("status") and attrs.get("status") in [
            MilestoneStep.Status.PENDING,
            MilestoneStep.Status.SUBMITTED,
            MilestoneStep.Status.PAID,
        ]:
            raise serializers.ValidationError(
                {"status": "Status cannot be changed to pending, submitted, or paid"}
            )

        if attrs.get("amount") and attrs.get("amount") <= 0:
            raise serializers.ValidationError(
                {"amount": "Amount must be greater than 0"}
            )

        # Budget validation
        if attrs.get("amount"):
            self._validate_budget_constraints(attrs)

        return super().validate(attrs)

    def _validate_budget_constraints(self, attrs):
        """Validate budget constraints for milestone step"""

        amount = attrs.get("amount")

        contract: Contract = Contract.objects.get(id=self.context["contract_id"])

        milestone: Milestone = Milestone.objects.get(contract=contract)

        contract_budget = contract.budget

        if amount >= contract_budget:
            raise serializers.ValidationError(
                {
                    "amount": f"Step amount (${amount}) must be less than contract budget (${contract_budget})"  # noqa: E501
                }
            )

        existing_steps_total = MilestoneStep.objects.filter(
            milestone=milestone
        ).exclude(id=self.instance.id if self.instance else None).aggregate(
            total=Sum("amount")
        )[
            "total"
        ] or Decimal(
            "0"
        )

        total_milestone_budget = existing_steps_total + amount

        if total_milestone_budget > contract_budget:
            remaining_budget = contract_budget - existing_steps_total
            raise serializers.ValidationError(
                {
                    "amount": f"Total milestone budget (${total_milestone_budget}) cannot exceed contract budget (${contract_budget}). Maximum allowed for this step: ${remaining_budget}"  # noqa: E501
                }
            )
