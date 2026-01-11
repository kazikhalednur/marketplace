from django.urls import include, path
from rest_framework.routers import DefaultRouter

from custom_admin.views.accounts import (
    AcceptedDomainAdminViewSet,
    OTPAdminViewSet,
    UserAdminViewSet,
    WebSocketIDAdminViewSet,
)
from custom_admin.views.biding import (
    AttachmentAdminViewSet as BidingAttachmentAdminViewSet,
)
from custom_admin.views.biding import (
    ContractAdminViewSet,
    ProposalAdminViewSet,
)
from custom_admin.views.chat import ConversationAdminViewSet, MessageAdminViewSet
from custom_admin.views.images import ImageAdminViewSet
from custom_admin.views.jobs import AttachmentAdminViewSet as JobAttachmentAdminViewSet
from custom_admin.views.jobs import (
    CategoryAdminViewSet,
    JobAdminViewSet,
    SkillAdminViewSet,
)
from custom_admin.views.notifications import NotificationAdminViewSet
from custom_admin.views.payments import (
    PaymentCallbackLogAdminViewSet,
    PaymentHistoryAdminViewSet,
    PaymentRequestAdminViewSet,
    PaymentTransactionAdminViewSet,
)
from custom_admin.views.work_diary import (
    MilestoneAdminViewSet,
    MilestoneStepAdminViewSet,
)

router = DefaultRouter()

# accounts app ViewSets
router.register(r"accounts/users", UserAdminViewSet, basename="admin-user")
router.register(r"accounts/otps", OTPAdminViewSet, basename="admin-otp")
router.register(
    r"accounts/accepted-domains",
    AcceptedDomainAdminViewSet,
    basename="admin-accepted-domain",
)
router.register(
    r"accounts/websocket-ids", WebSocketIDAdminViewSet, basename="admin-websocket-id"
)

# jobs app ViewSets
router.register(r"jobs/jobs", JobAdminViewSet, basename="admin-job")
router.register(r"jobs/categories", CategoryAdminViewSet, basename="admin-category")
router.register(r"jobs/skills", SkillAdminViewSet, basename="admin-skill")
router.register(
    r"jobs/attachments", JobAttachmentAdminViewSet, basename="admin-job-attachment"
)

# biding app ViewSets
router.register(r"biding/proposals", ProposalAdminViewSet, basename="admin-proposal")
router.register(r"biding/contracts", ContractAdminViewSet, basename="admin-contract")
router.register(
    r"biding/attachments",
    BidingAttachmentAdminViewSet,
    basename="admin-biding-attachment",
)

# images app ViewSets
router.register(r"images/images", ImageAdminViewSet, basename="admin-image")

# chat app ViewSets
router.register(
    r"chat/conversations", ConversationAdminViewSet, basename="admin-conversation"
)
router.register(r"chat/messages", MessageAdminViewSet, basename="admin-message")

# notifications app ViewSets
router.register(
    r"notifications/notifications",
    NotificationAdminViewSet,
    basename="admin-notification",
)

# work_diary app ViewSets
router.register(
    r"work-diary/milestones", MilestoneAdminViewSet, basename="admin-milestone"
)
router.register(
    r"work-diary/milestone-steps",
    MilestoneStepAdminViewSet,
    basename="admin-milestone-step",
)

# payments app ViewSets (READ-ONLY)
router.register(
    r"payments/payment-requests",
    PaymentRequestAdminViewSet,
    basename="admin-payment-request",
)
router.register(
    r"payments/payment-transactions",
    PaymentTransactionAdminViewSet,
    basename="admin-payment-transaction",
)
router.register(
    r"payments/payment-history",
    PaymentHistoryAdminViewSet,
    basename="admin-payment-history",
)
router.register(
    r"payments/payment-callback-logs",
    PaymentCallbackLogAdminViewSet,
    basename="admin-payment-callback-log",
)

urlpatterns = [
    path("", include(router.urls)),
]
