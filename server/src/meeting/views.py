from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsClient
from biding.models.contract import Contract

from .jitsi import generate_jitsi_token
from .models import Meeting, MeetingHistory
from .serializers import (
    ContractFreelancerSerializer,
    MeetingHistorySerializer,
    MeetingJoinSerializer,
    MeetingListSerializer,
    MeetingSerializer,
)


class MeetingPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class CreateMeetingView(CreateAPIView):
    """
    Create a new meeting.
    Only clients can create meetings.
    """

    permission_classes = [IsClient]
    serializer_class = MeetingSerializer

    def get_queryset(self):
        return Meeting.objects.filter(
            contract__client_profile__client=self.request.user
        ).order_by("-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class JoinMeetingView(APIView):
    """
    Join an existing meeting by room name.
    Generates a Jitsi token for the user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, room_name):
        try:
            meeting = Meeting.objects.get(room_name=room_name)
        except Meeting.DoesNotExist:
            return Response(
                {"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        is_creator = meeting.contract.client_profile.client.id == user.id
        is_guest = meeting.contract.freelancer_profile.freelancer.id == user.id

        if not (is_creator or is_guest):
            return Response(
                {"error": "You are not authorized to join this meeting"},
                status=status.HTTP_403_FORBIDDEN,
            )

        token = generate_jitsi_token(user, meeting.room_name, is_creator)

        MeetingHistory.objects.create(meeting=meeting, user=user)

        serializer = MeetingJoinSerializer({"token": token, "room_name": room_name})

        return Response(serializer.data, status=status.HTTP_200_OK)


class MeetingHistoryView(ListAPIView):
    """
    List all meeting history for the authenticated user.
    Shows all meetings the user has joined.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = MeetingHistorySerializer
    pagination_class = MeetingPagination

    def get_queryset(self):
        return (
            MeetingHistory.objects.filter(user__id=self.request.user.id)
            .select_related("meeting", "user")
            .order_by("-joined_at")
        )


class MyMeetingsView(ListAPIView):
    """
    List all meetings created by the authenticated client.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = MeetingListSerializer
    pagination_class = MeetingPagination

    def get_queryset(self):
        user = self.request.user

        if user.role == User.UserRole.CLIENT:
            queryset = Meeting.objects.filter(
                contract__client_profile__client__id=user.id
            ).order_by("-created_at")
            return queryset

        elif user.role == User.UserRole.FREELANCER:
            queryset = Meeting.objects.filter(
                contract__freelancer_profile__freelancer__id=user.id
            ).order_by("-created_at")
            return queryset

        else:
            return Meeting.objects.none()


class FreelancerListView(APIView):
    """
    List all freelancers with active contracts for the authenticated client.
    This allows clients to see which freelancers they can invite to meetings.
    """

    permission_classes = [IsClient]

    def get(self, request):
        user = request.user
        client_profile = user.client_profile

        contracts = (
            Contract.objects.filter(
                client_profile=client_profile, status=Contract.ContractStatus.ACTIVE
            )
            .select_related("freelancer_profile__freelancer", "job")
            .distinct()
        )

        freelancers_data = []
        for contract in contracts:
            freelancer = contract.freelancer_profile.freelancer
            freelancers_data.append(
                {
                    "username": freelancer.username,
                    "full_name": freelancer.get_full_name(),
                    "contract_id": contract.id,
                    "job_title": contract.job.title,
                    "contract_status": contract.status,
                }
            )

        serializer = ContractFreelancerSerializer(freelancers_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ContractMeetingListView(ListAPIView):
    """
    List all meetings for a specific contract.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = MeetingListSerializer
    pagination_class = MeetingPagination

    def get_queryset(self):
        contract_id = self.kwargs.get("contract_id")
        return Meeting.objects.filter(contract__id=contract_id).order_by("-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
