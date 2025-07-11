from django.db import models


class Settings(models.Model):
    """Model to store application settings."""

    otp_timeout = models.IntegerField("OTP Timeout", default=300)
    email_verify_timeout = models.IntegerField(
        "Email Verification Timeout", default=120
    )
    frontend_url = models.URLField("Frontend URL", default="http://localhost:3000")

    class Meta:
        verbose_name = "Setting"
        verbose_name_plural = "Settings"

    def __str__(self):
        return f"{self.key}: {self.value}"

    @classmethod
    def get_data(cls):
        return cls.objects.first()

    @classmethod
    def OTP_TIMEOUT(cls):
        return cls.get_data().otp_timeout

    @classmethod
    def EMAIL_VERIFIY_TIMEOUT(cls):
        return cls.get_data().email_verify_timeout

    @classmethod
    def FRONTEND_URL(cls):
        return cls.get_data().frontend_url

    def __str__(self):
        return "Application Settings"
