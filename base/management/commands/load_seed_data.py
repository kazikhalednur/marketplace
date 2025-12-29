import json
import os
from decimal import Decimal

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import (
    Client,
    ClientProfile,
    Freelancer,
    FreelancerProfile,
    FreelancerSubProfile,
    User,
)
from biding.models import Proposal
from jobs.models import Category, Job, Skill


class Command(BaseCommand):
    help = "Load seed data from JSON files in the seed directory"

    def handle(self, *args, **options):
        seed_dir = os.path.join(os.path.dirname(__file__), "../../../seed")

        self.stdout.write(self.style.SUCCESS("Starting seed data loading..."))

        try:
            with transaction.atomic():
                # Load categories
                self.load_categories(seed_dir)

                # Load skills
                self.load_skills(seed_dir)

                # Load users
                self.load_users(seed_dir)

                # Load freelancer profiles
                self.load_freelancer_profiles(seed_dir)

                # Load client profiles
                self.load_client_profiles(seed_dir)

                # Load jobs
                self.load_jobs(seed_dir)

                # Load proposals
                self.load_proposals(seed_dir)

            self.stdout.write(self.style.SUCCESS("Successfully loaded all seed data!"))
            self.print_summary()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error loading seed data: {str(e)}"))
            raise

    def load_categories(self, seed_dir):
        file_path = os.path.join(seed_dir, "categories.json")
        with open(file_path, "r") as f:
            categories = json.load(f)

        count = 0
        for cat_data in categories:
            category, created = Category.objects.get_or_create(name=cat_data["name"])
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"✓ Loaded {count} categories"))

    def load_skills(self, seed_dir):
        file_path = os.path.join(seed_dir, "skills.json")
        with open(file_path, "r") as f:
            skills = json.load(f)

        count = 0
        for skill_data in skills:
            category = Category.objects.get(name=skill_data["category"])
            skill, created = Skill.objects.get_or_create(
                name=skill_data["name"],
                defaults={
                    "category": category,
                    "description": skill_data.get("description", ""),
                },
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"✓ Loaded {count} skills"))

    def load_users(self, seed_dir):
        file_path = os.path.join(seed_dir, "users.json")
        with open(file_path, "r") as f:
            users = json.load(f)

        count = 0
        for user_data in users:
            if not User.objects.filter(email=user_data["email"]).exists():
                # Prepare common user fields
                user_fields = {
                    "email": user_data["email"],
                    "username": user_data["username"],
                    "first_name": user_data.get("first_name", ""),
                    "last_name": user_data.get("last_name", ""),
                    "role": user_data["role"],
                    "email_verified": user_data.get("email_verified", True),
                    "password": make_password("password123"),  # Default password
                }

                # Create role-specific user instances directly
                if user_data["role"] == User.UserRole.FREELANCER:
                    Freelancer.objects.create(**user_fields)
                elif user_data["role"] == User.UserRole.CLIENT:
                    Client.objects.create(**user_fields)
                else:
                    # For admin and other roles, create base User
                    User.objects.create(**user_fields)

                count += 1

        self.stdout.write(self.style.SUCCESS(f"✓ Loaded {count} users"))

    def load_freelancer_profiles(self, seed_dir):
        file_path = os.path.join(seed_dir, "freelancer_profiles.json")
        with open(file_path, "r") as f:
            profiles = json.load(f)

        count = 0
        for profile_data in profiles:
            try:
                freelancer = Freelancer.objects.get(username=profile_data["username"])
                profile, created = FreelancerProfile.objects.get_or_create(
                    freelancer=freelancer,
                    defaults={
                        "student_id": profile_data["student_id"],
                        "is_available": profile_data.get("is_available", True),
                        "available_connects": profile_data.get(
                            "available_connects", 30
                        ),
                    },
                )
                if created:
                    # Create a default sub-profile for each freelancer
                    FreelancerSubProfile.objects.create(
                        freelancer_profile=profile,
                        hours_per_week=40,
                        is_more_available=True,
                        hour_rate=Decimal("25.00"),
                        bio="Experienced professional ready to work on your projects.",
                    )
                    count += 1
            except Freelancer.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Freelancer {profile_data['username']} not found"
                    )
                )

        self.stdout.write(self.style.SUCCESS(f"✓ Loaded {count} freelancer profiles"))

    def load_client_profiles(self, seed_dir):
        file_path = os.path.join(seed_dir, "client_profiles.json")
        with open(file_path, "r") as f:
            profiles = json.load(f)

        count = 0
        for profile_data in profiles:
            try:
                client = Client.objects.get(username=profile_data["username"])
                profile, created = ClientProfile.objects.get_or_create(
                    client=client,
                    defaults={
                        "company_name": profile_data.get("company_name", ""),
                        "is_payment_verified": profile_data.get(
                            "is_payment_verified", False
                        ),
                        "is_phone_verified": profile_data.get(
                            "is_phone_verified", False
                        ),
                        "bio": profile_data.get("bio", ""),
                    },
                )
                if created:
                    count += 1
            except Client.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Client {profile_data['username']} not found")
                )

        self.stdout.write(self.style.SUCCESS(f"✓ Loaded {count} client profiles"))

    def load_jobs(self, seed_dir):
        file_path = os.path.join(seed_dir, "jobs.json")
        with open(file_path, "r") as f:
            jobs = json.load(f)

        count = 0
        for job_data in jobs:
            try:
                client = Client.objects.get(username=job_data["created_by"])
                category = Category.objects.get(name=job_data["category"])

                # Check if job already exists
                if not Job.objects.filter(
                    title=job_data["title"], created_by=client
                ).exists():
                    job = Job.objects.create(
                        title=job_data["title"],
                        description=job_data["description"],
                        category=category,
                        tags=job_data.get("tags", []),
                        min_budget=Decimal(str(job_data["min_budget"])),
                        max_budget=Decimal(str(job_data["max_budget"])),
                        is_fixed=job_data.get("is_fixed", True),
                        min_hourly_rate=(
                            Decimal(str(job_data["min_hourly_rate"]))
                            if job_data.get("min_hourly_rate")
                            else None
                        ),
                        max_hourly_rate=(
                            Decimal(str(job_data["max_hourly_rate"]))
                            if job_data.get("max_hourly_rate")
                            else None
                        ),
                        duration=job_data["duration"],
                        experience_level=job_data["experience_level"],
                        min_proposal_count=job_data["min_proposal_count"],
                        max_proposal_count=job_data["max_proposal_count"],
                        created_by=client,
                        status=job_data.get("status", "draft"),
                        connect=job_data.get("connect", 1),
                        privacy=job_data.get("privacy", "public"),
                        is_payment_verified=job_data.get("is_payment_verified", False),
                    )

                    # Add skills
                    for skill_name in job_data.get("skills", []):
                        try:
                            skill = Skill.objects.get(name=skill_name)
                            job.skills.add(skill)
                        except Skill.DoesNotExist:
                            self.stdout.write(
                                self.style.WARNING(f"Skill {skill_name} not found")
                            )

                    count += 1
            except Client.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Client {job_data['created_by']} not found")
                )
            except Category.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Category {job_data['category']} not found")
                )

        self.stdout.write(self.style.SUCCESS(f"✓ Loaded {count} jobs"))

    def load_proposals(self, seed_dir):
        file_path = os.path.join(seed_dir, "proposals.json")
        with open(file_path, "r") as f:
            proposals = json.load(f)

        count = 0
        for proposal_data in proposals:
            try:
                freelancer = Freelancer.objects.get(
                    username=proposal_data["freelancer"]
                )
                freelancer_profile = FreelancerProfile.objects.get(
                    freelancer=freelancer
                )
                freelancer_sub_profile = (
                    freelancer_profile.freelancer_sub_profiles.first()
                )

                job = Job.objects.get(title=proposal_data["job_title"])

                # Check if proposal already exists
                if not Proposal.objects.filter(
                    freelancer_sub_profile=freelancer_sub_profile, job=job
                ).exists():
                    Proposal.objects.create(
                        freelancer_sub_profile=freelancer_sub_profile,
                        job=job,
                        cover_letter=proposal_data["cover_letter"],
                        bid_amount=Decimal(str(proposal_data["bid_amount"])),
                        status=proposal_data.get("status", "pending"),
                        used_connects=job.connect,
                    )
                    count += 1
            except Freelancer.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f"Freelancer {proposal_data['freelancer']} not found"
                    )
                )
            except Job.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Job '{proposal_data['job_title']}' not found")
                )
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f"Error creating proposal: {str(e)}")
                )

        self.stdout.write(self.style.SUCCESS(f"✓ Loaded {count} proposals"))

    def print_summary(self):
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS("SEED DATA SUMMARY"))
        self.stdout.write("=" * 50)
        self.stdout.write(f"Categories: {Category.objects.count()}")
        self.stdout.write(f"Skills: {Skill.objects.count()}")
        self.stdout.write(f"Users: {User.objects.count()}")
        self.stdout.write(f"Freelancer Profiles: {FreelancerProfile.objects.count()}")
        self.stdout.write(f"Client Profiles: {ClientProfile.objects.count()}")
        self.stdout.write(f"Jobs: {Job.objects.count()}")
        self.stdout.write(f"Proposals: {Proposal.objects.count()}")
        self.stdout.write("=" * 50 + "\n")
