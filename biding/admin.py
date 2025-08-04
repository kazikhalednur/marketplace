from django.contrib import admin

from .models import Attachment, Contract, Proposal


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1
    fields = ("file", "uploaded_at")
    readonly_fields = ("uploaded_at",)


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = (
        "freelancer_sub_profile",
        "job",
        "bid_amount",
        "status",
        "submitted_at",
    )
    list_filter = ("status",)
    search_fields = (
        "freelancer_sub_profile__freelancer_profile__freelancer__username",
        "job__created_by__username",
        "job__title",
    )
    ordering = ("-submitted_at",)
    inlines = [AttachmentInline]

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ("freelancer_sub_profile", "job")
        return self.readonly_fields


admin.site.register(Contract)
