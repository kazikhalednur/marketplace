import json

from channels.generic.websocket import AsyncWebsocketConsumer
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes
from drf_spectacular_websocket.decorators import extend_ws_schema
from rest_framework.serializers import CharField, Serializer


class SomeMethodInputSerializer(Serializer):
    message = CharField()


class SomeMethodOutputSerializer(Serializer):
    message = CharField()


class SendMessageOutputSerializer(Serializer):
    message = CharField()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @extend_ws_schema(
        type="receive",
        summary="send_message_summary",
        description="send_message_description",
        request=None,
        responses=SendMessageOutputSerializer,
    )
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )

    @extend_ws_schema(
        type="send",
        summary="some_method_summary",
        description="some_method_description",
        request=SomeMethodInputSerializer,
        responses=SomeMethodOutputSerializer,
        parameters=[
            OpenApiParameter("room_name", OpenApiTypes.STR, required=True),
        ],
    )
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))
