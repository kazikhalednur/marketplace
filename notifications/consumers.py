import json

from asgiref.sync import sync_to_async
from django.core.paginator import EmptyPage, Paginator
from drf_spectacular_websocket.decorators import extend_ws_schema

from utils.permissions import IsAuthenticated
from utils.websocket import BaseAuthConsumer

from .models import Notification
from .serializers import (
    SendNotificationInputSerializer,
    SendNotificationOutputSerializer,
    SendNotificationSerializer,
)


class NotificationConsumer(BaseAuthConsumer):
    permission_classes = [IsAuthenticated]

    async def connect(self):
        await super().connect()
        user = self.scope["user"]
        self.room_name = await self.get_notification_room_name(user)
        self.room_group_name = f"notification_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.send_paginated_notifications(user, page=1, page_size=10)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @extend_ws_schema(
        type="receive",
        summary="recieve_notification_summary",
        request=None,
        responses=SendNotificationOutputSerializer(many=True),
    )
    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        data = json.loads(text_data)
        action = data.get("action")

        if action == "ping":
            await self.send_json({"message": "pong"})

        elif action == "get_notifications":
            page = int(data.get("page", 1))
            page_size = int(data.get("page_size", 10))
            user = self.scope["user"]
            await self.send_paginated_notifications(user, page, page_size)

    @extend_ws_schema(
        type="send",
        summary="send_notification_summary",
        request=SendNotificationInputSerializer,
        responses=SendNotificationOutputSerializer(many=True),
    )
    async def chat_message(self, event):
        await self.send_json(event["message"])

    async def send_paginated_notifications(self, user, page, page_size):
        paginated_data = await self.get_paginated_notifications(user, page, page_size)
        serializer = SendNotificationSerializer(paginated_data["results"], many=True)

        await self.send_json(
            {
                "success": True,
                "status_code": 200,
                "message": "Request Successful",
                "data": {
                    "count": paginated_data["count"],
                    "page": paginated_data["page"],
                    "page_size": paginated_data["page_size"],
                    "total_pages": paginated_data["total_pages"],
                    "results": serializer.data,
                },
            }
        )

    @sync_to_async
    def get_notification_room_name(self, user):
        return user.websocket.notication_id

    @sync_to_async
    def get_paginated_notifications(self, user, page, page_size):
        qs = Notification.objects.filter(user=user).order_by("-created_at")
        paginator = Paginator(qs, page_size)
        total = paginator.count

        try:
            current_page = paginator.page(page)
        except EmptyPage:
            current_page = paginator.page(paginator.num_pages)

        return {
            "count": total,
            "results": list(current_page.object_list),
            "page": current_page.number,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
        }
