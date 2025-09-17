from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import Conversation

from .models import GoogleMeeting, ZoomMeeting
from .serializers import (
    GoogleMeetingCreateSerializer,
    GoogleMeetingListSerializer,
)
from .zoom_serializers import ZoomMeetingListSerializer


class MeetingPagination(PageNumberPagination):
    """Custom pagination for meetings"""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class GoogleMeetingCreateView(CreateAPIView):
    """
    Create a new Google Calendar meeting
    """

    serializer_class = GoogleMeetingCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        conversation = get_object_or_404(
            Conversation, conversation_id=self.kwargs["conversation_id"]
        )
        context["conversation"] = conversation
        context["created_by"] = self.request.user
        return context


class GoogleMeetingListView(ListAPIView):
    """
    List all meetings for the authenticated user
    """

    serializer_class = GoogleMeetingListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MeetingPagination

    def get_queryset(self):
        """Return meetings for the authenticated user"""
        queryset = GoogleMeeting.objects.filter(
            created_by=self.request.user,
            conversation__conversation_id=self.kwargs["conversation_id"],
        )

        # Filter upcoming meetings if requested
        upcoming = self.request.query_params.get("upcoming")
        if upcoming and upcoming.lower() == "true":
            now = timezone.now()
            queryset = queryset.filter(start_time__gt=now)

        # Order by start time (upcoming first)
        return queryset.order_by("start_time")


class GoogleMeetingUpcomingView(APIView):
    """
    Get upcoming meetings for the authenticated user
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 5))
        now = timezone.now()

        meetings = GoogleMeeting.objects.filter(
            created_by=request.user,
            start_time__gt=now,
            conversation__conversation_id=self.kwargs["conversation_id"],
        ).order_by("start_time")[:limit]

        serializer = GoogleMeetingListSerializer(meetings, many=True)
        return Response(
            {
                "success": True,
                "upcoming_meetings": serializer.data,
                "count": len(serializer.data),
            }
        )


class GoogleMeetingStatsView(APIView):
    """
    Get meeting statistics for the authenticated user
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_meetings = GoogleMeeting.objects.filter(
            created_by=request.user,
            conversation__conversation_id=self.kwargs["conversation_id"],
        )
        now = timezone.now()

        stats = {
            "total_meetings": user_meetings.count(),
            "upcoming_meetings": user_meetings.filter(start_time__gt=now).count(),
            "past_meetings": user_meetings.filter(start_time__lt=now).count(),
        }

        return Response({"success": True, "stats": stats})


class AllMeetingsListView(APIView):
    """
    List all Zoom meetings created by the authenticated user
    """

    permission_classes = [IsAuthenticated]
    pagination_class = MeetingPagination

    def get(self, request):
        """Return Zoom meetings created by the user across all conversations"""
        user = request.user
        now = timezone.now()

        # Base queryset: only Zoom meetings created by the user
        zoom_meetings = ZoomMeeting.objects.filter(created_by=user).select_related(
            "conversation",
            "conversation__client_profile",
            "conversation__freelancer_profile",
        )

        # Filters
        upcoming = request.query_params.get("upcoming")
        conversation_id = request.query_params.get("conversation_id")

        if conversation_id:
            zoom_meetings = zoom_meetings.filter(
                conversation__conversation_id=conversation_id
            )

        if upcoming and upcoming.lower() == "true":
            zoom_meetings = zoom_meetings.filter(start_time__gt=now)

        # Serialize and annotate meeting type
        zoom_data = ZoomMeetingListSerializer(zoom_meetings, many=True).data
        for meeting in zoom_data:
            meeting["meeting_type"] = "zoom"

        # Sort by start time
        zoom_data.sort(key=lambda x: x.get("start_time", ""))

        # Paginate
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(zoom_data, request)

        if page is not None:
            return paginator.get_paginated_response(
                {
                    "meetings": page,
                    "total_count": len(zoom_data),
                    "zoom_count": len(zoom_data),
                }
            )

        return Response(
            {
                "success": True,
                "meetings": zoom_data,
                "total_count": len(zoom_data),
                "zoom_count": len(zoom_data),
            }
        )
