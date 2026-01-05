from celery import Task, shared_task

from accounts.models import User

from .models import Meeting
from .utils import create_zoom_meeting


@shared_task
def create_zoom_meeting_task(
    conversation_id, created_by_email, topic, start_time, duration, **kwargs
) -> Task:
    """
    Create a Zoom meeting asynchronously and save to database

    Args:
        conversation_id: ID of the conversation
        created_by_email: Email of the user creating the meeting
        topic: Meeting topic
        start_time: Meeting start time
        duration: Meeting duration

    Returns:
        Dict containing meeting details or error
    """
    try:
        # Create Zoom meeting
        meeting_result = create_zoom_meeting(
            topic=topic, start_time=start_time, duration=duration, **kwargs
        )

        if not meeting_result["success"]:
            return {"success": False, "error": meeting_result["error"]}

        # Import here to avoid circular imports
        from chat.models import Conversation

        # Get the conversation and user objects
        conversation: Conversation = Conversation.objects.get(
            conversation_id=conversation_id
        )
        created_by = User.objects.get(email=created_by_email)

        # Create meeting in database
        meeting = Meeting.objects.create(
            conversation=conversation,
            created_by=created_by,
            topic=topic,
            duration=duration,
            start_time=start_time,
            meeting_id=meeting_result["data"]["meeting_id"],
            password=meeting_result["data"]["password"],
            join_url=meeting_result["data"]["join_url"],
            start_url=meeting_result["data"]["start_url"],
            raw_response=meeting_result["data"]["raw_response"],
        )

        # # Add client as registrant
        # client_registrant_result = add_zoom_registrant(
        #     meeting_id=meeting_result["data"]["meeting_id"],
        #     email=conversation.client_profile.client.email,
        #     first_name=conversation.client_profile.client.first_name,
        #     last_name=conversation.client_profile.client.last_name,
        # )

        # # Add freelancer as registrant
        # freelancer_registrant_result = add_zoom_registrant(
        #     meeting_id=meeting_result["data"]["meeting_id"],
        #     email=conversation.freelancer_profile.freelancer.email,
        #     first_name=conversation.freelancer_profile.freelancer.first_name,
        #     last_name=conversation.freelancer_profile.freelancer.last_name,
        # )

        # # Extract tokens from join URLs if registrations were successful
        # tk_client = None
        # tk_freelancer = None

        # if client_registrant_result["success"] and "join_url" in client_registrant_result["data"]: # noqa: E501
        #     tk_client = extract_query_param(client_registrant_result["data"]["join_url"], "tk")  # noqa: E501

        # if freelancer_registrant_result["success"] and "join_url" in freelancer_registrant_result["data"]: # noqa: E501
        #     tk_freelancer = extract_query_param(freelancer_registrant_result["data"]["join_url"], "tk") # noqa: E501

        # meeting.tk_client = tk_client
        # meeting.tk_freelancer = tk_freelancer
        # meeting.save(update_fields=["tk_client", "tk_freelancer"])

        return {
            "success": True,
            "meeting_id": meeting.id,
            "message": "Meeting created successfully",
        }

    except Exception as e:
        return {"success": False, "error": f"Failed to create meeting: {str(e)}"}


create_zoom_meeting_task: Task
