from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Client, User
from accounts.permissions import IsClient, IsFreelancer
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


class CreateMeetingView(CreateAPIView):
    """
    Create a new meeting.
    Only clients can create meetings.
    """

    permission_classes = [IsClient]
    serializer_class = MeetingSerializer

    def get_queryset(self):
        return (
            Meeting.objects.filter(created_by=self.request.user)
            .select_related("created_by", "guest")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        client = Client.objects.get(id=self.request.user.id)
        serializer.save(created_by=client)


class JoinMeetingView(APIView):
    """
    Join an existing meeting by room name.
    Generates a Jitsi token for the user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, room_name):
        try:
            meeting = Meeting.objects.select_related("created_by", "guest").get(
                room_name=room_name
            )
        except Meeting.DoesNotExist:
            return Response(
                {"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        is_creator = meeting.created_by.id == user.id
        is_guest = meeting.guest.id == user.id

        if not (is_creator or is_guest):
            return Response(
                {"error": "You are not authorized to join this meeting"},
                status=status.HTTP_403_FORBIDDEN,
            )

        token = generate_jitsi_token(user, meeting.room_name)

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

    permission_classes = [IsClient]
    serializer_class = MeetingListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == User.UserRole.CLIENT:
            return (
                Meeting.objects.filter(created_by__id=user.id)
                .select_related("created_by", "guest")
                .order_by("-created_at")
            )
        elif user.role == User.UserRole.FREELANCER:
            return (
                Meeting.objects.filter(guest__id=user.id)
                .select_related("created_by", "guest")
                .order_by("-created_at")
            )
        else:
            return Meeting.objects.none()


class GuestMeetingsView(ListAPIView):
    """
    List all meetings where the authenticated freelancer is a guest.
    """

    permission_classes = [IsFreelancer]
    serializer_class = MeetingListSerializer

    def get_queryset(self):
        return (
            Meeting.objects.filter(guest__id=self.request.user.id)
            .select_related("created_by", "guest")
            .order_by("-created_at")
        )


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
