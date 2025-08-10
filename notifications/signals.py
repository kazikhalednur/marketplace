from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.paginator import Paginator
from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.serializers import SendNotificationSerializer

from .models import Notification


@receiver(post_save, sender=Notification)
def send_notification_on_create(sender, instance, created, **kwargs):
    if not created:
        return

    user = instance.user
    group_name = f"notification_{user.websocket.notification_id}"
    channel_layer = get_channel_layer()

    page = 1
    page_size = 10

    qs = Notification.objects.filter(user=user).order_by("-created_at")
    paginator = Paginator(qs, page_size)
    current_page = paginator.page(page)
    notifications = current_page.object_list

    serializer = SendNotificationSerializer(notifications, many=True)

    message = {
        "success": True,
        "status_code": 200,
        "message": "Request Successful",
        "data": {
            "count": paginator.count,
            "page": page,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "results": serializer.data,
        },
    }

    async_to_sync(channel_layer.group_send)(
        group_name, {"type": "chat.message", "message": message}
    )
