from django.core.management.base import BaseCommand

from chat.models import Conversation, Message


class Command(BaseCommand):
    help = "Update Conversation model by removing contract field and adding freelancer_profile and client_profile fields"  # noqa: E501

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be done without making changes",
        )
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="Show detailed output",
        )
        parser.add_argument(
            "--check-only",
            action="store_true",
            help="Only check current state without making any changes",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        verbose = options["verbose"]
        check_only = options["check_only"]

        self.stdout.write(self.style.SUCCESS("Starting Conversation model update..."))

        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN MODE - No changes will be made")
            )

        if check_only:
            self.stdout.write(
                self.style.WARNING("CHECK ONLY MODE - Only checking current state")
            )

        try:
            # Step 1: Check current state
            self._check_current_state(verbose)

            if not check_only:
                # Step 2: Populate freelancer_profile and client_profile from Message data   # noqa: E501
                self._populate_profiles_from_messages(dry_run, verbose)

                # Step 3: Verify data consistency
                self._verify_data_consistency(dry_run, verbose)

            self.stdout.write(
                self.style.SUCCESS("Conversation model update completed successfully!")
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error during Conversation model update: {str(e)}")
            )
            if not check_only:
                raise

    def _check_current_state(self, verbose):
        """Check the current state of conversations and messages"""
        self.stdout.write("Checking current state...")

        try:
            total_conversations = Conversation.objects.count()
            total_messages = Message.objects.count()

            self.stdout.write(f"  Total conversations: {total_conversations}")
            self.stdout.write(f"  Total messages: {total_messages}")

            if total_conversations > 0:
                conversations_with_profiles = Conversation.objects.filter(
                    freelancer_profile__isnull=False, client_profile__isnull=False
                ).count()

                conversations_without_profiles = Conversation.objects.filter(
                    freelancer_profile__isnull=True, client_profile__isnull=True
                ).count()

                self.stdout.write(
                    f"  Conversations with both profiles: {conversations_with_profiles}"
                )
                self.stdout.write(
                    f"  Conversations without profiles: {conversations_without_profiles}"  # noqa: E501
                )

                if verbose and conversations_without_profiles > 0:
                    self.stdout.write("  Conversations without profiles:")
                    for conv in Conversation.objects.filter(
                        freelancer_profile__isnull=True, client_profile__isnull=True
                    )[:5]:
                        message_count = conv.messages.count()
                        self.stdout.write(
                            f"    - Conversation {conv.id}: {message_count} messages"
                        )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error checking current state: {str(e)}")
            )
            raise

    def _populate_profiles_from_messages(self, dry_run, verbose):
        """Populate freelancer_profile and client_profile from Message data"""
        self.stdout.write("Step 1: Populating profiles from Message data...")

        conversations = Conversation.objects.all()
        total_conversations = conversations.count()

        if total_conversations == 0:
            self.stdout.write("  No conversations found.")
            return

        self.stdout.write(f"  Found {total_conversations} conversations to update.")

        updated_count = 0
        skipped_count = 0

        for conversation in conversations:
            if verbose:
                self.stdout.write(f"  Processing conversation {conversation.id}...")

            # Skip if already has profiles
            if conversation.freelancer_profile and conversation.client_profile:
                if verbose:
                    self.stdout.write(
                        f"    Conversation {conversation.id} already has profiles, skipping..."  # noqa: E501
                    )
                continue

            # Get the first message to determine freelancer and client profiles
            first_message = conversation.messages.first()

            if not first_message:
                if verbose:
                    self.stdout.write(
                        f"    No messages found for conversation {conversation.id}, skipping..."  # noqa: E501
                    )
                skipped_count += 1
                continue

            # Determine freelancer and client profiles from messages
            freelancer_profile = None
            client_profile = None

            # Look through all messages to find both profiles
            for message in conversation.messages.all():
                if message.freelancer_profile and not freelancer_profile:
                    freelancer_profile = message.freelancer_profile
                if message.client_profile and not client_profile:
                    client_profile = message.client_profile

                # If we found both, we can stop
                if freelancer_profile and client_profile:
                    break

            if not freelancer_profile or not client_profile:
                if verbose:
                    self.stdout.write(
                        f"    Could not determine both profiles for conversation {conversation.id}, skipping..."  # noqa: E501
                    )
                skipped_count += 1
                continue

            # Update the conversation with the found profiles
            if not dry_run:
                conversation.freelancer_profile = freelancer_profile
                conversation.client_profile = client_profile
                conversation.save()

            updated_count += 1
            if verbose:
                self.stdout.write(
                    f"    Updated conversation {conversation.id} with freelancer {freelancer_profile.id} and client {client_profile.id}"  # noqa: E501
                )

        self.stdout.write(f"  Updated {updated_count} conversations.")
        self.stdout.write(
            f"  Skipped {skipped_count} conversations (no messages or incomplete profile data)."  # noqa: E501
        )

    def _verify_data_consistency(self, dry_run, verbose):
        """Verify that all conversations have proper profile assignments"""
        self.stdout.write("Step 2: Verifying data consistency...")

        conversations_without_freelancer = Conversation.objects.filter(
            freelancer_profile__isnull=True
        )
        conversations_without_client = Conversation.objects.filter(
            client_profile__isnull=True
        )

        freelancer_count = conversations_without_freelancer.count()
        client_count = conversations_without_client.count()

        if freelancer_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f"  Found {freelancer_count} conversations without freelancer_profile"  # noqa: E501
                )
            )
            if verbose:
                for conv in conversations_without_freelancer[:5]:  # Show first 5
                    self.stdout.write(
                        f"    Conversation {conv.id} missing freelancer_profile"
                    )

        if client_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f"  Found {client_count} conversations without client_profile"
                )
            )
            if verbose:
                for conv in conversations_without_client[:5]:  # Show first 5
                    self.stdout.write(
                        f"    Conversation {conv.id} missing client_profile"
                    )

        if freelancer_count == 0 and client_count == 0:
            self.stdout.write("  All conversations have proper profile assignments.")

        # Check for conversations with messages but no profiles
        conversations_with_messages_but_no_profiles = Conversation.objects.filter(
            messages__isnull=False,
            freelancer_profile__isnull=True,
            client_profile__isnull=True,
        ).distinct()

        orphaned_count = conversations_with_messages_but_no_profiles.count()
        if orphaned_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f"  Found {orphaned_count} conversations with messages but no profile assignments"  # noqa: E501
                )
            )
            if verbose:
                for conv in conversations_with_messages_but_no_profiles[:5]:
                    message_count = conv.messages.count()
                    self.stdout.write(
                        f"    Conversation {conv.id} has {message_count} messages but no profiles"  # noqa: E501
                    )

    def _get_profiles_from_messages(self, conversation):
        """Helper method to extract profiles from conversation messages"""
        freelancer_profile = None
        client_profile = None

        for message in conversation.messages.all():
            if message.freelancer_profile and not freelancer_profile:
                freelancer_profile = message.freelancer_profile
            if message.client_profile and not client_profile:
                client_profile = message.client_profile

            # If we found both, we can stop
            if freelancer_profile and client_profile:
                break

        return freelancer_profile, client_profile
