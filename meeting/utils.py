from __future__ import print_function

import os.path
from datetime import datetime
from typing import Dict, List, Optional

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


class GoogleCalendarService:
    """Service class for Google Calendar operations"""

    def __init__(self):
        self.service = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate with Google Calendar API"""
        creds = None
        token_path = settings.BASE_DIR / "meeting/token.json"

        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                credentials_path = settings.BASE_DIR / "meeting/credentials.json"
                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_path, SCOPES
                )
                creds = flow.run_local_server(port=0)

            with open(token_path, "w") as token:
                token.write(creds.to_json())

        self.service = build("calendar", "v3", credentials=creds)

    def create_meeting(
        self,
        summary: str,
        description: str,
        start_time: datetime,
        end_time: datetime,
        attendees: List[str],
        timezone: str = "Asia/Dhaka",
    ) -> Dict:
        """
        Create a Google Calendar meeting with Google Meet link

        Args:
            summary: Meeting title
            description: Meeting description
            start_time: Meeting start time
            end_time: Meeting end time
            attendees: List of attendee email addresses
            timezone: Timezone for the meeting

        Returns:
            Dict containing meeting details
        """
        try:
            event = {
                "summary": summary,
                "description": description,
                "start": {
                    "dateTime": start_time.isoformat(),
                    "timeZone": timezone,
                },
                "end": {
                    "dateTime": end_time.isoformat(),
                    "timeZone": timezone,
                },
                "attendees": [{"email": email} for email in attendees],
                "conferenceData": {
                    "createRequest": {
                        "requestId": f"meeting_{datetime.now().timestamp()}",
                        "conferenceSolutionKey": {"type": "hangoutsMeet"},
                    }
                },
            }

            created_event = (
                self.service.events()
                .insert(
                    calendarId="primary",
                    body=event,
                    conferenceDataVersion=1,
                    sendUpdates="all",
                )
                .execute()
            )

            return {
                "success": True,
                "meeting_id": created_event["id"],
                "meeting_url": created_event["conferenceData"]["entryPoints"][0]["uri"],
                "meeting_summary": created_event["summary"],
                "meeting_description": created_event.get("description", ""),
                "meeting_start_time": created_event["start"]["dateTime"],
                "meeting_end_time": created_event["end"]["dateTime"],
                "meeting_attendees": attendees,
                "meeting_status": created_event.get("status", "confirmed"),
                "google_event": created_event,
            }

        except Exception as error:
            return {"success": False, "error": str(error)}

    def update_meeting(
        self,
        meeting_id: str,
        summary: Optional[str] = None,
        description: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        attendees: Optional[List[str]] = None,
        timezone: str = "Asia/Dhaka",
    ) -> Dict:
        """
        Update an existing Google Calendar meeting

        Args:
            meeting_id: Google Calendar event ID
            summary: New meeting title
            description: New meeting description
            start_time: New meeting start time
            end_time: New meeting end time
            attendees: New list of attendee email addresses
            timezone: Timezone for the meeting

        Returns:
            Dict containing updated meeting details
        """
        try:
            # First, get the existing event
            event = (
                self.service.events()
                .get(calendarId="primary", eventId=meeting_id)
                .execute()
            )

            # Update fields if provided
            if summary:
                event["summary"] = summary
            if description:
                event["description"] = description
            if start_time:
                event["start"] = {
                    "dateTime": start_time.isoformat(),
                    "timeZone": timezone,
                }
            if end_time:
                event["end"] = {
                    "dateTime": end_time.isoformat(),
                    "timeZone": timezone,
                }
            if attendees:
                event["attendees"] = [{"email": email} for email in attendees]

            # Update the event
            updated_event = (
                self.service.events()
                .update(
                    calendarId="primary",
                    eventId=meeting_id,
                    body=event,
                    sendUpdates="all",
                )
                .execute()
            )

            return {
                "success": True,
                "meeting_id": updated_event["id"],
                "meeting_url": updated_event["conferenceData"]["entryPoints"][0]["uri"],
                "meeting_summary": updated_event["summary"],
                "meeting_description": updated_event.get("description", ""),
                "meeting_start_time": updated_event["start"]["dateTime"],
                "meeting_end_time": updated_event["end"]["dateTime"],
                "meeting_attendees": [
                    attendee["email"] for attendee in updated_event.get("attendees", [])
                ],
                "meeting_status": updated_event.get("status", "confirmed"),
                "google_event": updated_event,
            }

        except Exception as error:
            return {"success": False, "error": str(error)}

    def delete_meeting(self, meeting_id: str) -> Dict:
        """
        Delete a Google Calendar meeting

        Args:
            meeting_id: Google Calendar event ID

        Returns:
            Dict containing operation result
        """
        try:
            self.service.events().delete(
                calendarId="primary", eventId=meeting_id, sendUpdates="all"
            ).execute()

            return {"success": True, "message": "Meeting deleted successfully"}

        except Exception as error:
            return {"success": False, "error": str(error)}

    def get_meeting(self, meeting_id: str) -> Dict:
        """
        Get a Google Calendar meeting details

        Args:
            meeting_id: Google Calendar event ID

        Returns:
            Dict containing meeting details
        """
        try:
            event = (
                self.service.events()
                .get(calendarId="primary", eventId=meeting_id)
                .execute()
            )

            return {
                "success": True,
                "meeting_id": event["id"],
                "meeting_url": event["conferenceData"]["entryPoints"][0]["uri"],
                "meeting_summary": event["summary"],
                "meeting_description": event.get("description", ""),
                "meeting_start_time": event["start"]["dateTime"],
                "meeting_end_time": event["end"]["dateTime"],
                "meeting_attendees": [
                    attendee["email"] for attendee in event.get("attendees", [])
                ],
                "meeting_status": event.get("status", "confirmed"),
                "google_event": event,
            }

        except Exception as error:
            return {"success": False, "error": str(error)}


def create_google_meeting(
    summary: str,
    description: str,
    start_time: datetime,
    end_time: datetime,
    attendees: List[str],
    timezone: str = "Asia/Dhaka",
) -> Dict:
    """
    Convenience function to create a Google Calendar meeting

    Args:
        summary: Meeting title
        description: Meeting description
        start_time: Meeting start time
        end_time: Meeting end time
        attendees: List of attendee email addresses
        timezone: Timezone for the meeting

    Returns:
        Dict containing meeting details
    """
    service = GoogleCalendarService()
    return service.create_meeting(
        summary, description, start_time, end_time, attendees, timezone
    )


def update_google_meeting(
    meeting_id: str,
    summary: Optional[str] = None,
    description: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    attendees: Optional[List[str]] = None,
    timezone: str = "Asia/Dhaka",
) -> Dict:
    """
    Convenience function to update a Google Calendar meeting

    Args:
        meeting_id: Google Calendar event ID
        summary: New meeting title
        description: New meeting description
        start_time: New meeting start time
        end_time: New meeting end time
        attendees: New list of attendee email addresses
        timezone: Timezone for the meeting

    Returns:
        Dict containing updated meeting details
    """
    service = GoogleCalendarService()
    return service.update_meeting(
        meeting_id, summary, description, start_time, end_time, attendees, timezone
    )


def delete_google_meeting(meeting_id: str) -> Dict:
    """
    Convenience function to delete a Google Calendar meeting

    Args:
        meeting_id: Google Calendar event ID

    Returns:
        Dict containing operation result
    """
    service = GoogleCalendarService()
    return service.delete_meeting(meeting_id)


def get_google_meeting(meeting_id: str) -> Dict:
    """
    Convenience function to get a Google Calendar meeting details

    Args:
        meeting_id: Google Calendar event ID

    Returns:
        Dict containing meeting details
    """
    service = GoogleCalendarService()
    return service.get_meeting(meeting_id)
