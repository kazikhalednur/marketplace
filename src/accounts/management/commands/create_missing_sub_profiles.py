from django.core.management.base import BaseCommand

from accounts.models.profile.freelancer import FreelancerProfile
from accounts.models.profile.sub.freelancer import FreelancerSubProfile


class Command(BaseCommand):
    help = "Create missing FreelancerSubProfiles for existing freelancers"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be done without making changes",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN MODE - No changes will be made")
            )

        # Get all freelancer profiles
        freelancer_profiles = FreelancerProfile.objects.all()
        total_profiles = freelancer_profiles.count()

        self.stdout.write(f"Found {total_profiles} freelancer profiles")

        # Check which ones are missing sub profiles
        missing_sub_profiles = []
        for profile in freelancer_profiles:
            if (
                not hasattr(profile, "freelancer_sub_profiles")
                or not profile.freelancer_sub_profiles.exists()
            ):
                missing_sub_profiles.append(profile)

        self.stdout.write(
            f"Found {len(missing_sub_profiles)} freelancers missing sub profiles"
        )

        if not dry_run and missing_sub_profiles:
            created_count = 0
            for profile in missing_sub_profiles:
                try:
                    FreelancerSubProfile.objects.create(
                        freelancer_profile=profile,
                        hours_per_week=None,
                        is_more_available=True,
                        hour_rate=None,
                        bio="",
                        linkedin=None,
                        twitter=None,
                        github=None,
                        portfolio=None,
                    )
                    created_count += 1
                    self.stdout.write(
                        f"Created sub profile for {profile.freelancer.username}"
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Failed to create sub profile for {profile.freelancer.username}: {e}"  # noqa: E501
                        )
                    )

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created {created_count} sub profiles")
            )
        elif dry_run:
            for profile in missing_sub_profiles:
                self.stdout.write(
                    f"Would create sub profile for {profile.freelancer.username}"
                )
        else:
            self.stdout.write(
                self.style.SUCCESS("All freelancers already have sub profiles")
            )

        # Final count
        final_sub_profiles = FreelancerSubProfile.objects.count()
        self.stdout.write(f"Total sub profiles: {final_sub_profiles}")
