import requests
from django.conf import settings

# Load credentials from Django settings
ZOOM_ACCOUNT_ID = settings.ZOOM_ACCOUNT_ID
ZOOM_CLIENT_ID = settings.ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET = settings.ZOOM_CLIENT_SECRET


def get_access_token():
    """
    Get Zoom access token using Server-to-Server OAuth
    """
    url = "https://zoom.us/oauth/token"
    payload = {
        "grant_type": "account_credentials",
        "account_id": ZOOM_ACCOUNT_ID,
    }

    response = requests.post(
        url, data=payload, auth=(ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)
    )
    response.raise_for_status()
    return response.json()["access_token"]


def create_meeting(topic, start_time, duration=30):
    """
    Create a Zoom meeting restricted to approved registrants.
    """
    token = get_access_token()
    url = "https://api.zoom.us/v2/users/me/meetings"
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "topic": topic,
        "type": 2,  # Scheduled meeting
        "start_time": start_time,  # ISO8601 UTC, e.g., "2025-09-13T12:00:00Z"
        "duration": duration,
        "timezone": "UTC",
        "settings": {
            "join_before_host": True,
            "mute_upon_entry": True,
            "waiting_room": False,
            # "join_before_host": False,  # Prevent joining before host
            # "waiting_room": True,  # Enable waiting room
            # "approval_type": 2,  # Only approved registrants
            # "registrants_email_notification": True,  # Notify registrants
            # "registration_type": 1,
        },
    }

    res = requests.post(url, json=payload, headers=headers)
    res.raise_for_status()
    return res.json()
