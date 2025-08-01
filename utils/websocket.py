# consumers/base.py

import json

from channels.generic.websocket import AsyncWebsocketConsumer

from .permissions import AllowAny


class BaseAuthConsumer(AsyncWebsocketConsumer):
    permission_classes = [AllowAny]  # default

    async def connect(self):
        if await self.check_permissions():
            await self.accept()
        else:
            await self.accept()
            await self.handle_unauthorized()

    async def check_permissions(self):
        for permission in self.permission_classes:
            permission_instance = permission()
            if not await permission_instance.has_permission(self.scope):
                return False
        return True

    async def handle_unauthorized(self):
        """Default unauthorized behavior"""
        await self.send_json({"message": "Unauthorized"})
        await self.close(code=4003)

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))
