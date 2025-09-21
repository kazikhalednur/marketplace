import time

import jwt
from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import ListAPIView, ListCreateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Meeting
from .serializers import MeetingSerializer, ZoomMeetingSDKAuthSerializer


class MeetingPagination(PageNumberPagination):
    """Custom pagination for Zoom meetings"""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


@extend_schema(tags=["zoom_meetings"])
class MeetingListCreateView(ListCreateAPIView):
    """Create a new meeting and list all meetings for a conversation"""

    serializer_class = MeetingSerializer
    pagination_class = MeetingPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Meeting.objects.filter(
            conversation__conversation_id=self.kwargs["conversation_id"]
        ).order_by("-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["conversation_id"] = self.kwargs["conversation_id"]
        context["created_by_email"] = self.request.user.email  # Use email instead of ID
        return context

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {"message": "Meeting creation initiated successfully"},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["zoom_meetings"])
class MeetingListView(ListAPIView):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Meeting.objects.filter(created_by=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["created_by_email"] = self.request.user.email  # Use email instead of ID
        return context


@extend_schema(
    tags=["zoom_meetings"],
    summary="Generate Zoom Meeting SDK JWT token",
    description="Generate a JWT token for Zoom Meeting SDK authentication",
)
class ZoomMeetingSDKAuthView(APIView):
    """Generate JWT token for Zoom Meeting SDK authentication"""

    permission_classes = [AllowAny]  # Allow unauthenticated access for SDK auth
    serializer_class = ZoomMeetingSDKAuthSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = serializer.validated_data

        # Extract validated data
        meeting_number = validated_data["meetingNumber"]
        role = validated_data["role"]
        expiration_seconds = validated_data.get("expirationSeconds")
        video_webrtc_mode = validated_data.get("videoWebRtcMode", 0)

        # Calculate timestamps
        iat = int(time.time())
        exp = iat + (
            expiration_seconds if expiration_seconds else 7200
        )  # Default 2 hours

        # Create JWT payload
        payload = {
            "appKey": settings.ZOOM_CLIENT_ID,
            "mn": meeting_number,
            "role": role,
            "iat": iat,
            "exp": exp,
            "tokenExp": exp,
            "video_webrtc_mode": video_webrtc_mode,
        }

        # Generate JWT token
        try:
            jwt_token = jwt.encode(
                payload, settings.ZOOM_CLIENT_SECRET, algorithm="HS256"
            )

            return Response({"signature": jwt_token})

        except Exception:
            return Response(
                {"error": "Failed to generate JWT token"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
