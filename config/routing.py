# from chat.routings import websocket_urlpatterns as chat_ws
from notifications.routings import websocket_urlpatterns as notifications_ws

websocket_urlpatterns = notifications_ws
