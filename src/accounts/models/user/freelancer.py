from django.contrib.auth.models import UserManager

from .base import User


class FreelancerManager(UserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.UserRole.FREELANCER)


class Freelancer(User):
    role = User.UserRole.FREELANCER

    objects = FreelancerManager()

    class Meta:
        proxy = True
        verbose_name = "Freelancer"
        verbose_name_plural = "Freelancers"

    def save(self, *args, **kwargs):
        self.role = self.UserRole.FREELANCER

        # Remove 'role' from update_fields if present
        update_fields = kwargs.pop("update_fields", None)
        if update_fields:
            if "role" in update_fields:
                update_fields.remove("role")
        kwargs["update_fields"] = update_fields
        super(Freelancer, self).save(*args, **kwargs)
