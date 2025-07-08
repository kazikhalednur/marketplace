from django.db import models

from ..user.freelancer import Freelancer


class FreelancerProfile(models.Model):
    freelancer = models.OneToOneField(
        Freelancer,
        on_delete=models.CASCADE,
        related_name="freelancer_profile",
        verbose_name="Freelancer",
    )
    student_id = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Student ID",
        help_text="Your student ID, e.g., 2019-12345-1",
    )

    class Meta:
        verbose_name = "Freelancer Profile"
        verbose_name_plural = "Freelancer Profiles"

    def __str__(self):
        return f"{self.freelancer.username}'s Profile"
