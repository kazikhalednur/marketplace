from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.crypto import constant_time_compare
from django.utils.http import base36_to_int


class EmailVerifyTokenGenerator(PasswordResetTokenGenerator):
    key_salt = "accounts.tokens.EmailVerifyTokenGenerator"

    def check_token(self, user, token):
        """
        Check that a password reset token is correct for a given user.
        """
        if not (user and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except ValueError:
            return False

        try:
            ts = base36_to_int(ts_b36)
        except ValueError:
            return False

        # Check that the timestamp/uid has not been tampered with
        for secret in [self.secret, *self.secret_fallbacks]:
            if constant_time_compare(
                self._make_token_with_timestamp(user, ts, secret),
                token,
            ):
                break
        else:
            return False

        return True

    def check_timeout(self, user, token):
        if self.check_token(user, token):
            ts_b36, _ = token.split("-")
            ts = base36_to_int(ts_b36)

            return (
                self._num_seconds(self._now()) - ts
            ) <= settings.EMAIL_VERIFIY_TIMEOUT

        return False


email_verify_token = EmailVerifyTokenGenerator()
