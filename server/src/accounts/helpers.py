import json

from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from rest_framework.exceptions import ValidationError

from .models import AcceptedDomain


def google_user_details(code: str):
    try:
        credentials_path = settings.GOOGLE_CREDENTIALS_PATH

        if not credentials_path.exists():
            raise FileNotFoundError("Google credentials file not found.")
        with open(credentials_path, "r") as file:
            credentials = json.load(file)

        SCOPE = [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ]

        flow = Flow.from_client_config(client_config=credentials, scopes=SCOPE)

        flow.redirect_uri = credentials["web"]["redirect_uris"][0]

        flow.fetch_token(code=code)

        id_token_str = flow.credentials.id_token
        idinfo = id_token.verify_oauth2_token(
            id_token_str, google_requests.Request(), credentials["web"]["client_id"]
        )
        print(idinfo, "idinfo")

        return idinfo

    except Exception as e:
        raise ValidationError(
            {"error": "Invalid Google code or credentials", "details": str(e)}
        )


def match_email_domain(email):
    email_domain = email.split("@")[1]

    if not email_domain:
        return False

    # Check if the email domain is in the accepted domains
    accepted_domains = AcceptedDomain.objects.filter(is_active=True).values_list(
        "domain", flat=True
    )
    if email_domain in accepted_domains:
        return True

    return False


def match_email_id_digits_group(student_id, email):

    student_id_digits = "".join(filter(str.isdigit, student_id))[::-1]
    email_username = email.split("@")[0][::-1]

    email_digits = "".join(filter(str.isdigit, email_username))

    max_len = min(len(student_id_digits), len(email_digits))
    match_length = 0

    for i in range(max_len):
        if student_id_digits[i] == email_digits[i]:
            match_length += 1
        else:
            break

    return match_length >= 3


def split_name_equal(full_name):
    parts = full_name.strip().split()
    n = len(parts)
    if n == 0:
        return "", ""
    split_point = (n + 1) // 2  # half rounded up

    first_part = " ".join(parts[:split_point])
    last_part = " ".join(parts[split_point:])
    return {"first_name": first_part, "last_name": last_part}
