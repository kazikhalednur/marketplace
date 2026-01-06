from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    inline_serializer,
)
from rest_framework import filters, permissions
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    ListAPIView,
    UpdateAPIView,
)
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import (
    NotificationCreateSerializer,
    NotificationListSerializer,
)


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class NotificationListView(ListAPIView):
    serializer_class = NotificationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["message_type", "is_read"]
    search_fields = ["message"]
    ordering_fields = ["created_at", "is_read"]
    ordering = ["-created_at"]

    def get_queryset(self):
        # Return empty queryset during schema generation
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Add unread count to context
        context["unread_count"] = Notification.objects.filter(
            user=self.request.user, is_read=False
        ).count()
        return context


class NotificationCreateView(CreateAPIView):
    serializer_class = NotificationCreateSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        serializer.save()


class MarkNotificationReadView(UpdateAPIView):
    serializer_class = NotificationListSerializer  # Required for schema generation
    http_method_names = ["patch"]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return empty queryset during schema generation
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user, pk=self.kwargs["pk"])

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name="MarkNotificationReadResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="Notification marked as read"
                    ),
                },
            )
        },
    )
    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save()

        return Response({"message": "Notification marked as read"})


class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            200: inline_serializer(
                name="MarkAllNotificationsReadResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="All notifications marked as read"
                    ),
                    "updated_count": drf_serializers.IntegerField(),
                },
            )
        },
    )
    def post(self, request):
        try:
            updated_count = Notification.objects.filter(
                user=request.user, is_read=False
            ).update(is_read=True)

            return Response(
                {
                    "message": f"{updated_count} notifications marked as read",
                    "updated_count": updated_count,
                }
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NotificationStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={
            200: inline_serializer(
                name="NotificationStatsResponse",
                fields={
                    "stats": inline_serializer(
                        name="NotificationStats",
                        fields={
                            "total": drf_serializers.IntegerField(),
                            "unread": drf_serializers.IntegerField(),
                            "read": drf_serializers.IntegerField(),
                            "by_type": drf_serializers.DictField(),
                        },
                    )
                },
            )
        },
    )
    def get(self, request):
        try:
            total_notifications = Notification.objects.filter(user=request.user).count()
            unread_notifications = Notification.objects.filter(
                user=request.user, is_read=False
            ).count()

            # Count by type
            type_counts = {}
            for notification_type in Notification.NotificationType.choices:
                type_counts[notification_type[0]] = Notification.objects.filter(
                    user=request.user, message_type=notification_type[0]
                ).count()

            return Response(
                {
                    "stats": {
                        "total": total_notifications,
                        "unread": unread_notifications,
                        "read": total_notifications - unread_notifications,
                        "by_type": type_counts,
                    },
                }
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteNotificationView(DestroyAPIView):
    serializer_class = NotificationListSerializer  # Required for schema generation
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return empty queryset during schema generation
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

    @extend_schema(
        request=None,
        responses={
            204: inline_serializer(
                name="DeleteNotificationResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="Notification deleted successfully"
                    ),
                },
            )
        },
    )
    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response(
            {"message": "Notification deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


@extend_schema(
    parameters=[
        OpenApiParameter(
            "message_type",
            OpenApiTypes.STR,
            OpenApiParameter.QUERY,
            description="Filter by message type",
            enum=Notification.NotificationType,
        ),
        OpenApiParameter(
            "is_read",
            OpenApiTypes.BOOL,
            OpenApiParameter.QUERY,
            description="Filter by read status",
        ),
    ],
)
class DeleteAllNotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={
            200: inline_serializer(
                name="DeleteAllNotificationsResponse",
                fields={
                    "message": drf_serializers.CharField(
                        default="All notifications deleted successfully"
                    ),
                    "deleted_count": drf_serializers.IntegerField(),
                },
            )
        }
    )
    def delete(self, request):
        try:
            message_type = request.query_params.get("message_type")
            is_read = request.query_params.get("is_read")

            queryset = Notification.objects.filter(user=request.user)

            if message_type:
                queryset = queryset.filter(message_type=message_type)

            if is_read is not None:
                is_read_bool = is_read.lower() == "true"
                queryset = queryset.filter(is_read=is_read_bool)

            deleted_count = queryset.count()
            queryset.delete()

            return Response(
                {
                    "success": True,
                    "message": f"{deleted_count} notifications deleted successfully",
                    "deleted_count": deleted_count,
                }
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
