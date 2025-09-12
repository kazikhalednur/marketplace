from __future__ import print_function

import os.path

from django.conf import settings
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Scopes: Calendar events (with Meet link) + Meet API
SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/meetings.space.created",
]


def main():
    creds = None
    token_path = settings.BASE_DIR / "meeting/token.json"
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            credentials_path = settings.BASE_DIR / "meeting/credentials.json"
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, "w") as token:
            token.write(creds.to_json())

    try:
        service = build("calendar", "v3", credentials=creds)

        event = {
            "summary": "Team Meeting",
            "description": "Discussion about project updates",
            "start": {
                "dateTime": "2025-09-12T23:00:00+06:00",  # Change date/time
                "timeZone": "Asia/Dhaka",
            },
            "end": {
                "dateTime": "2025-09-12T23:30:00+06:00",  # Change date/time
                "timeZone": "Asia/Dhaka",
            },
            "attendees": [
                {"email": "kazikhalednur@gmail.com"},
                {"email": "khalednur20@gmail.com"},
            ],
            "conferenceData": {
                "createRequest": {
                    "requestId": "sample123",  # must be unique per request
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
        }

        created_event = (
            service.events()
            .insert(
                calendarId="primary",
                body=event,
                conferenceDataVersion=1,
                sendUpdates="all",  # ensures email is sent to attendees
            )
            .execute()
        )

        print("Meeting created:")
        print("📌 Summary:", created_event["summary"])
        print("🔗 Meet Link:", created_event["conferenceData"]["entryPoints"][0]["uri"])
        print("📧 Invites sent to attendees")

    except Exception as error:
        print(f"An error occurred: {error}")


if __name__ == "__main__":
    main()
