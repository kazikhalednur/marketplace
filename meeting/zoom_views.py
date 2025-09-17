from django.db.models import Avg, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from chat.models import Conversation
from utils.helpers import Response as CustomResponse

from .models import ZoomMeeting
from .zoom_serializers import (
    ZoomMeetingCreateSerializer,
    ZoomMeetingDetailSerializer,
    ZoomMeetingListSerializer,
    ZoomMeetingStatsSerializer,
    ZoomMeetingUpdateSerializer,
    ZoomRegistrantSerializer,
)
from .zoom_utils import ZoomUtility


class ZoomMeetingPagination(PageNumberPagination):
    """Custom pagination for Zoom meetings"""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingCreateView(CreateAPIView):
    """
    Create a new Zoom meeting
    """

    serializer_class = ZoomMeetingCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        conversation = get_object_or_404(
            Conversation, conversation_id=self.kwargs["conversation_id"]
        )
        context["conversation"] = conversation
        context["created_by"] = self.request.user
        return context


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingConversationListView(ListAPIView):
    """
    List all Zoom meetings for the authenticated user
    """

    serializer_class = ZoomMeetingListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ZoomMeetingPagination

    def get_queryset(self):
        """Return meetings for the authenticated user"""
        queryset = ZoomMeeting.objects.filter(
            created_by=self.request.user,
            conversation__conversation_id=self.kwargs["conversation_id"],
        )

        # Filter upcoming meetings if requested
        upcoming = self.request.query_params.get("upcoming")
        if upcoming and upcoming.lower() == "true":
            # Note: This would need start_time field in the model to be accurate
            # For now, we'll return all meetings as the model doesn't have start_time
            pass

        # Order by creation time (newest first)
        return queryset.order_by("-created_at")


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific Zoom meeting
    """

    serializer_class = ZoomMeetingDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
    lookup_url_kwarg = "meeting_id"

    def get_queryset(self):
        """Return meetings for the authenticated user"""
        return ZoomMeeting.objects.filter(
            created_by=self.request.user,
            conversation__conversation_id=self.kwargs["conversation_id"],
        )

    def update(self, request, *args, **kwargs):
        """Update a Zoom meeting"""
        instance = self.get_object()
        serializer = ZoomMeetingUpdateSerializer(
            instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        updated_meeting = serializer.save()

        return CustomResponse(
            status_code=200,
            message="Zoom meeting updated successfully",
            data=ZoomMeetingDetailSerializer(updated_meeting).data,
        )

    def destroy(self, request, *args, **kwargs):
        """Delete a Zoom meeting"""
        instance = self.get_object()

        try:
            # Delete from Zoom first
            zoom_utility = ZoomUtility()
            zoom_result = zoom_utility.delete_meeting(instance.zoom_id)

            if not zoom_result["success"]:
                return CustomResponse(
                    status_code=400,
                    message=f"Failed to delete Zoom meeting: {zoom_result['error']}",
                    data={},
                )

            # Delete from local database
            instance.delete()

            return CustomResponse(
                status_code=200, message="Zoom meeting deleted successfully", data={}
            )

        except Exception as e:
            return CustomResponse(
                status_code=500,
                message=f"Error deleting Zoom meeting: {str(e)}",
                data={},
            )


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingUpcomingView(APIView):
    """
    Get upcoming Zoom meetings for the authenticated user
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        limit = int(request.query_params.get("limit", 5))
        now = timezone.now()

        # Filter upcoming meetings based on start_time
        meetings = ZoomMeeting.objects.filter(
            created_by=request.user,
            conversation__conversation_id=conversation_id,
            start_time__gt=now,
        ).order_by("start_time")[:limit]

        serializer = ZoomMeetingListSerializer(meetings, many=True)
        return CustomResponse(
            status_code=200,
            message="Upcoming meetings retrieved successfully",
            data={
                "upcoming_meetings": serializer.data,
                "count": len(serializer.data),
            },
        )


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingStatsView(APIView):
    """
    Get Zoom meeting statistics for the authenticated user
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        user_meetings = ZoomMeeting.objects.filter(
            created_by=request.user,
            conversation__conversation_id=conversation_id,
        )

        now = timezone.now()
        current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_year = now.replace(
            month=1, day=1, hour=0, minute=0, second=0, microsecond=0
        )

        # Calculate statistics
        total_meetings = user_meetings.count()

        # Calculate time-based statistics
        upcoming_meetings = user_meetings.filter(start_time__gt=now).count()
        past_meetings = user_meetings.filter(start_time__lt=now).count()
        meetings_this_month = user_meetings.filter(
            start_time__gte=current_month
        ).count()
        meetings_this_year = user_meetings.filter(start_time__gte=current_year).count()

        # Duration statistics
        duration_stats = user_meetings.aggregate(
            total_duration=Sum("duration"), average_duration=Avg("duration")
        )

        total_duration_minutes = duration_stats["total_duration"] or 0
        average_duration_minutes = duration_stats["average_duration"] or 0

        stats_data = {
            "total_meetings": total_meetings,
            "upcoming_meetings": upcoming_meetings,
            "past_meetings": past_meetings,
            "meetings_this_month": meetings_this_month,
            "meetings_this_year": meetings_this_year,
            "total_duration_minutes": total_duration_minutes,
            "average_duration_minutes": average_duration_minutes,
        }

        serializer = ZoomMeetingStatsSerializer(stats_data)

        return CustomResponse(
            status_code=200,
            message="Zoom meeting statistics retrieved successfully",
            data=serializer.data,
        )


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingRegistrantView(APIView):
    """
    Add a registrant to a Zoom meeting
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id, meeting_id):
        """Add a registrant to the meeting"""
        meeting = get_object_or_404(
            ZoomMeeting,
            id=meeting_id,
            created_by=request.user,
            conversation__conversation_id=conversation_id,
        )

        serializer = ZoomRegistrantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Add registrant to Zoom meeting
            zoom_utility = ZoomUtility()
            result = zoom_utility.add_registrant(
                meeting_id=meeting.zoom_id, **serializer.validated_data
            )

            if not result["success"]:
                return CustomResponse(
                    status_code=400,
                    message=f"Failed to add registrant: {result['error']}",
                    data={},
                )

            return CustomResponse(
                status_code=201,
                message="Registrant added successfully",
                data={
                    "registrant_id": result.get("registrant_id"),
                    "meeting_id": meeting.zoom_id,
                },
            )

        except Exception as e:
            return CustomResponse(
                status_code=500, message=f"Error adding registrant: {str(e)}", data={}
            )


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingSyncView(APIView):
    """
    Sync Zoom meeting details from Zoom API
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id, meeting_id):
        """Sync meeting details from Zoom"""
        meeting = get_object_or_404(
            ZoomMeeting,
            id=meeting_id,
            created_by=request.user,
            conversation__conversation_id=conversation_id,
        )

        try:
            # Get updated details from Zoom
            zoom_utility = ZoomUtility()
            result = zoom_utility.get_meeting(meeting.zoom_id)

            if not result["success"]:
                return CustomResponse(
                    status_code=400,
                    message=f"Failed to sync meeting: {result['error']}",
                    data={},
                )

            # Update local meeting with fresh data
            meeting.topic = result.get("topic", meeting.topic)
            meeting.duration = result.get("duration", meeting.duration)
            meeting.join_url = result.get("join_url", meeting.join_url)
            meeting.start_url = result.get("start_url", meeting.start_url)
            meeting.save()

            return CustomResponse(
                status_code=200,
                message="Meeting synced successfully",
                data=ZoomMeetingDetailSerializer(meeting).data,
            )

        except Exception as e:
            return CustomResponse(
                status_code=500, message=f"Error syncing meeting: {str(e)}", data={}
            )


@extend_schema(tags=["zoom_meetings"])
class ZoomMeetingListView(ListAPIView):
    """
    List all Zoom meetings for the authenticated user
    """

    serializer_class = ZoomMeetingListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ZoomMeetingPagination

    def get_queryset(self):
        """Return meetings for the authenticated user"""
        queryset = ZoomMeeting.objects.filter(created_by__id=self.request.user.id)

        return queryset.order_by("-created_at")
