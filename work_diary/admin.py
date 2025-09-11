from django.contrib import admin

from .models import (
    Milestone,
    MilestoneStep,
    MilestoneStepSubmission,
)


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ["id", "contract", "number_of_steps", "status"]
    search_fields = ["contract__id", "number_of_steps"]


@admin.register(MilestoneStep)
class MilestoneStepAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "milestone",
        "step_number",
        "title",
        "amount",
        "status",
        "due_date",
    ]
    list_filter = ["status", "due_date"]
    search_fields = ["title", "description", "milestone__id"]
    ordering = ["milestone", "step_number"]


@admin.register(MilestoneStepSubmission)
class MilestoneStepSubmissionAdmin(admin.ModelAdmin):
    list_display = ["id", "milestone_step", "freelancer_profile", "status"]
    list_filter = ["status"]
    search_fields = [
        "milestone_step__title",
        "freelancer_profile__freelancer__username",
    ]
