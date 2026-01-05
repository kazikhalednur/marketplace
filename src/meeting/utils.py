from datetime import datetime
from typing import Dict, Optional

import requests
from django.conf import settings
from django.utils import timezone

# Load credentials from Django settings
ZOOM_ACCOUNT_ID = settings.ZOOM_ACCOUNT_ID
ZOOM_CLIENT_ID = settings.ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET = settings.ZOOM_CLIENT_SECRET


class ZoomUtility:
    """Comprehensive utility class for Zoom API operations"""

    def __init__(self):
        self.base_url = "https://api.zoom.us/v2"
        self.access_token = None

    def get_access_token(self):
        """
        Get Zoom access token using Server-to-Server OAuth
        """
        if self.access_token:
            return self.access_token

        url = "https://zoom.us/oauth/token"
        payload = {
            "grant_type": "account_credentials",
            "account_id": ZOOM_ACCOUNT_ID,
        }

        try:
            response = requests.post(
                url, data=payload, auth=(ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)
            )
            response.raise_for_status()
            self.access_token = response.json()["access_token"]
            return self.access_token
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get access token: {str(e)}")

    def _get_headers(self):
        """Get headers with authorization token"""
        return {"Authorization": f"Bearer {self.get_access_token()}"}

    def create_meeting(
        self, topic: str, start_time: datetime, duration: int = 30, **kwargs
    ) -> Dict:
        """
        Create a Zoom meeting with customizable settings

        Args:
            topic: Meeting topic/title
            start_time: Meeting start time (datetime object)
            duration: Meeting duration in minutes

        Returns:
            Dict containing meeting details or error
        """
        try:
            url = f"{self.base_url}/users/me/meetings"
            headers = self._get_headers()

            # Format start time for Zoom API
            start_time_str = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")

            payload = {
                "topic": topic,
                # "agenda": topic,
                "type": 2,  # Scheduled meeting
                "start_time": start_time_str,
                "duration": duration,
                "timezone": "UTC",
                "settings": {
                    "join_before_host": True,
                    "waiting_room": False,
                    # "approval_type": 0,
                    # "registrants_confirmation_email": True,
                    # "registration_type": 1,
                },
                **kwargs,
            }
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()

            meeting_data = response.json()

            data = {
                # "signature": signature,
                "meeting_id": meeting_data["id"],
                "password": meeting_data["password"],
                # "tk": registrantToken,
                "join_url": meeting_data["join_url"],
                "start_url": meeting_data["start_url"],
                "raw_response": meeting_data,
            }

            return {"success": True, "data": data}

        except requests.exceptions.RequestException as e:
            return {"success": False, "error": f"Zoom API error: {str(e)}"}

        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def get_meeting(self, meeting_id: str) -> Dict:
        """
        Get details of a specific Zoom meeting

        Args:
            meeting_id: Zoom meeting ID

        Returns:
            Dict containing meeting details or error
        """
        try:
            url = f"{self.base_url}/meetings/{meeting_id}"
            headers = self._get_headers()

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            meeting_data = response.json()

            return {
                "success": True,
                "meeting_id": meeting_data["id"],
                "zoom_id": str(meeting_data["id"]),
                "topic": meeting_data["topic"],
                "join_url": meeting_data["join_url"],
                "start_url": meeting_data["start_url"],
                "password": meeting_data.get("password", ""),
                "start_time": meeting_data["start_time"],
                "duration": meeting_data["duration"],
                "timezone": meeting_data["timezone"],
                "created_at": meeting_data["created_at"],
                "status": meeting_data.get("status", "waiting"),
                "raw_data": meeting_data,
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Zoom API error: {str(e)}",
                "status_code": getattr(e.response, "status_code", None),
            }
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def update_meeting(
        self,
        meeting_id: str,
        topic: Optional[str] = None,
        start_time: Optional[datetime] = None,
        duration: Optional[int] = None,
        timezone: Optional[str] = None,
        password: Optional[str] = None,
        **kwargs,
    ) -> Dict:
        """
        Update an existing Zoom meeting

        Args:
            meeting_id: Zoom meeting ID
            topic: New meeting topic
            start_time: New start time
            duration: New duration
            timezone: New timezone
            password: New password
            **kwargs: Additional settings to update

        Returns:
            Dict containing update result
        """
        try:
            url = f"{self.base_url}/meetings/{meeting_id}"
            headers = self._get_headers()

            payload = {}

            if topic:
                payload["topic"] = topic
            if start_time:
                payload["start_time"] = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
            if duration:
                payload["duration"] = duration
            if timezone:
                payload["timezone"] = timezone
            if password:
                payload["password"] = password

            # Add any additional settings
            if kwargs:
                payload.update(kwargs)

            response = requests.patch(url, json=payload, headers=headers)
            response.raise_for_status()

            return {
                "success": True,
                "message": "Meeting updated successfully",
                "meeting_id": meeting_id,
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Zoom API error: {str(e)}",
                "status_code": getattr(e.response, "status_code", None),
            }
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def delete_meeting(self, meeting_id: str) -> Dict:
        """
        Delete a Zoom meeting

        Args:
            meeting_id: Zoom meeting ID

        Returns:
            Dict containing deletion result
        """
        try:
            url = f"{self.base_url}/meetings/{meeting_id}"
            headers = self._get_headers()

            response = requests.delete(url, headers=headers)
            response.raise_for_status()

            return {
                "success": True,
                "message": "Meeting deleted successfully",
                "meeting_id": meeting_id,
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Zoom API error: {str(e)}",
                "status_code": getattr(e.response, "status_code", None),
            }
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def list_meetings(
        self, user_id: str = "me", page_size: int = 30, page_number: int = 1
    ) -> Dict:
        """
        List user's meetings

        Args:
            user_id: User ID (default: "me" for current user)
            page_size: Number of meetings per page
            page_number: Page number

        Returns:
            Dict containing meetings list or error
        """
        try:
            url = f"{self.base_url}/users/{user_id}/meetings"
            headers = self._get_headers()
            params = {
                "page_size": page_size,
                "page_number": page_number,
                "type": "scheduled",  # Only scheduled meetings
            }

            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()

            data = response.json()

            return {
                "success": True,
                "meetings": data.get("meetings", []),
                "page_count": data.get("page_count", 0),
                "page_number": data.get("page_number", 1),
                "page_size": data.get("page_size", 30),
                "total_records": data.get("total_records", 0),
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Zoom API error: {str(e)}",
                "status_code": getattr(e.response, "status_code", None),
            }
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def add_registrant(
        self, meeting_id: str, email: str, first_name: str, last_name: str, **kwargs
    ) -> Dict:
        """
        Add a registrant to a meeting

        Args:
            meeting_id: Zoom meeting ID
            email: Registrant email
            first_name: Registrant first name
            last_name: Registrant last name
            **kwargs: Additional registrant fields

        Returns:
            Dict containing registration result
        """
        try:
            url = f"{self.base_url}/meetings/{meeting_id}/registrants"
            headers = self._get_headers()

            payload = {
                "email": email,
                "first_name": first_name + " " + last_name,
                **kwargs,
            }

            response = requests.post(url, json=payload, headers=headers, timeout=10)
            print(response.json())
            response.raise_for_status()

            response_data = response.json()
            return {
                "success": True,
                "data": {
                    "registrant_id": response_data.get("registrant_id"),
                    "join_url": response_data.get("join_url"),
                    "raw_response": response_data,
                },
            }

        except requests.exceptions.RequestException as e:
            return {"success": False, "error": f"Zoom API error: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def get_meeting_participants(self, meeting_id: str) -> Dict:
        """
        Get participants of a meeting (requires meeting to be completed)

        Args:
            meeting_id: Zoom meeting ID

        Returns:
            Dict containing participants list or error
        """
        try:
            url = f"{self.base_url}/meetings/{meeting_id}/participants"
            headers = self._get_headers()

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            data = response.json()

            return {
                "success": True,
                "participants": data.get("participants", []),
                "page_count": data.get("page_count", 0),
                "page_size": data.get("page_size", 30),
                "total_records": data.get("total_records", 0),
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Zoom API error: {str(e)}",
                "status_code": getattr(e.response, "status_code", None),
            }
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def get_meeting_recordings(self, meeting_id: str) -> Dict:
        """
        Get recordings of a meeting

        Args:
            meeting_id: Zoom meeting ID

        Returns:
            Dict containing recordings list or error
        """
        try:
            url = f"{self.base_url}/meetings/{meeting_id}/recordings"
            headers = self._get_headers()

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            data = response.json()

            return {
                "success": True,
                "recordings": data.get("recording_files", []),
                "meeting_id": data.get("id"),
                "meeting_uuid": data.get("uuid"),
                "account_id": data.get("account_id"),
                "host_id": data.get("host_id"),
                "topic": data.get("topic"),
                "start_time": data.get("start_time"),
                "duration": data.get("duration"),
                "total_size": data.get("total_size"),
                "recording_count": data.get("recording_count", 0),
            }

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Zoom API error: {str(e)}",
                "status_code": getattr(e.response, "status_code", None),
            }
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def validate_meeting_time(self, start_time: datetime, duration: int = 30) -> Dict:
        """
        Validate meeting time constraints

        Args:
            start_time: Meeting start time
            duration: Meeting duration in minutes

        Returns:
            Dict containing validation result
        """
        now = timezone.now()

        # Check if start time is in the future
        if start_time <= now:
            return {"valid": False, "error": "Meeting start time must be in the future"}

        # Check if duration is reasonable
        if duration < 1:
            return {
                "valid": False,
                "error": "Meeting duration must be at least 1 minute",
            }

        if duration > 1440:  # 24 hours
            return {"valid": False, "error": "Meeting duration cannot exceed 24 hours"}

        # Check if meeting is not too far in the future (1 year limit)
        one_year_from_now = now.replace(year=now.year + 1)
        if start_time > one_year_from_now:
            return {
                "valid": False,
                "error": "Meeting cannot be scheduled more than 1 year in advance",
            }

        return {"valid": True, "message": "Meeting time is valid"}

    def format_meeting_data(self, meeting_data: Dict) -> Dict:
        """
        Format meeting data for consistent response

        Args:
            meeting_data: Raw meeting data from Zoom API

        Returns:
            Dict containing formatted meeting data
        """
        return {
            "meeting_id": meeting_data.get("id"),
            "zoom_id": str(meeting_data.get("id", "")),
            "topic": meeting_data.get("topic", ""),
            "join_url": meeting_data.get("join_url", ""),
            "start_url": meeting_data.get("start_url", ""),
            "password": meeting_data.get("password", ""),
            "start_time": meeting_data.get("start_time", ""),
            "duration": meeting_data.get("duration", 0),
            "timezone": meeting_data.get("timezone", "UTC"),
            "created_at": meeting_data.get("created_at", ""),
            "status": meeting_data.get("status", "waiting"),
            "host_id": meeting_data.get("host_id", ""),
            "uuid": meeting_data.get("uuid", ""),
            "agenda": meeting_data.get("agenda", ""),
            "settings": meeting_data.get("settings", {}),
        }


# Convenience functions for easy usage
def create_zoom_meeting(topic, start_time, duration=30, **kwargs):
    """
    Create a Zoom meeting (convenience function)

    Args:
        topic: Meeting topic
        start_time: Meeting start time (datetime object or ISO string)
        duration: Meeting duration in minutes
        **kwargs: Additional meeting settings

    Returns:
        Dict containing meeting details
    """
    utility = ZoomUtility()

    # Convert string to datetime if needed
    if isinstance(start_time, str):
        start_time = datetime.fromisoformat(start_time.replace("Z", "+00:00"))

    return utility.create_meeting(topic, start_time, duration, **kwargs)


def get_zoom_meeting(meeting_id):
    """Get Zoom meeting details (convenience function)"""
    utility = ZoomUtility()
    return utility.get_meeting(meeting_id)


def update_zoom_meeting(meeting_id, **kwargs):
    """Update Zoom meeting (convenience function)"""
    utility = ZoomUtility()
    return utility.update_meeting(meeting_id, **kwargs)


def delete_zoom_meeting(meeting_id):
    """Delete Zoom meeting (convenience function)"""
    utility = ZoomUtility()
    return utility.delete_meeting(meeting_id)


def list_zoom_meetings(user_id="me", page_size=30, page_number=1):
    """List user meetings (convenience function)"""
    utility = ZoomUtility()
    return utility.list_meetings(user_id, page_size, page_number)


def add_zoom_registrant(meeting_id, email, first_name, last_name, **kwargs):
    """Add meeting registrant (convenience function)"""
    utility = ZoomUtility()
    return utility.add_registrant(meeting_id, email, first_name, last_name, **kwargs)


def get_zoom_meeting_participants(meeting_id):
    """Get meeting participants (convenience function)"""
    utility = ZoomUtility()
    return utility.get_meeting_participants(meeting_id)


def get_zoom_meeting_recordings(meeting_id):
    """Get meeting recordings (convenience function)"""
    utility = ZoomUtility()
    return utility.get_meeting_recordings(meeting_id)


def validate_zoom_meeting_time(start_time, duration=30):
    """Validate meeting time (convenience function)"""
    utility = ZoomUtility()
    return utility.validate_meeting_time(start_time, duration)


def format_zoom_meeting_data(meeting_data):
    """Format meeting data (convenience function)"""
    utility = ZoomUtility()
    return utility.format_meeting_data(meeting_data)
