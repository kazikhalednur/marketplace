from django.core.management.base import BaseCommand

from biding.models import Proposal
from biding.services import process_proposal_acceptance


class Command(BaseCommand):
    help = "Create contracts for accepted proposals"

    def add_arguments(self, parser):
        parser.add_argument(
            "--proposal-id",
            type=int,
            help="Specific proposal ID to create contract for",
        )
        parser.add_argument(
            "--all",
            action="store_true",
            help="Create contracts for all accepted proposals",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be created without actually creating",
        )

    def handle(self, *args, **options):
        proposal_id = options.get("proposal_id")
        create_all = options.get("all")
        dry_run = options.get("dry_run")

        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN MODE - No contracts will be created")
            )

        if proposal_id:
            # Create contract for specific proposal
            self.create_contract_for_proposal(proposal_id, dry_run)
        elif create_all:
            # Create contracts for all accepted proposals
            self.create_contracts_for_all_accepted_proposals(dry_run)
        else:
            self.stdout.write(
                self.style.ERROR(
                    "Please specify --proposal-id <id> or --all to create contracts"
                )
            )

    def create_contract_for_proposal(self, proposal_id, dry_run=False):
        """Create contract for a specific proposal"""
        try:
            proposal = Proposal.objects.get(id=proposal_id)

            if proposal.status != Proposal.BidStatus.ACCEPTED:
                self.stdout.write(
                    self.style.ERROR(
                        f"Proposal {proposal_id} is not accepted (status: {proposal.status})"  # noqa: E501
                    )
                )
                return

            if hasattr(proposal, "contract") and proposal.contract:
                self.stdout.write(
                    self.style.WARNING(f"Proposal {proposal_id} already has a contract")
                )
                return

            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Would create contract for proposal {proposal_id}"
                    )
                )
                return

            contract = process_proposal_acceptance(proposal)
            if contract:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Successfully created contract {contract.id} for proposal {proposal_id}"  # noqa: E501
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Proposal {proposal_id} already has a contract")
                )

        except Proposal.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Proposal {proposal_id} not found"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating contract: {str(e)}"))

    def create_contracts_for_all_accepted_proposals(self, dry_run=False):
        """Create contracts for all accepted proposals that don't have contracts"""
        try:
            # Get all accepted proposals without contracts
            accepted_proposals = Proposal.objects.filter(
                status=Proposal.BidStatus.ACCEPTED
            ).select_related("job", "freelancer_sub_profile")

            # Filter out proposals that already have contracts
            proposals_without_contracts = []
            for proposal in accepted_proposals:
                if not hasattr(proposal, "contract") or not proposal.contract:
                    proposals_without_contracts.append(proposal)

            if not proposals_without_contracts:
                self.stdout.write(
                    self.style.WARNING("No accepted proposals without contracts found")
                )
                return

            self.stdout.write(
                f"Found {len(proposals_without_contracts)} accepted proposals without contracts"  # noqa: E501
            )

            if dry_run:
                for proposal in proposals_without_contracts:
                    self.stdout.write(
                        f"Would create contract for proposal {proposal.id} "
                        f"(Job: {proposal.job.title}, "
                        f"Freelancer: {proposal.freelancer_sub_profile.freelancer_profile.freelancer.username})"  # noqa: E501
                    )
                return

            created_count = 0
            for proposal in proposals_without_contracts:
                try:
                    contract = process_proposal_acceptance(proposal)
                    if not contract:
                        continue
                    created_count += 1

                    self.stdout.write(
                        f"Created contract {contract.id} for proposal {proposal.id} (Job: {proposal.job.title})"  # noqa: E501
                    )

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Error creating contract for proposal {proposal.id}: {str(e)} "  # noqa: E501
                        )
                    )

            self.stdout.write(
                self.style.SUCCESS(f"Successfully created {created_count} contracts")
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error processing proposals: {str(e)}"))

    def display_summary(self):
        """Display summary of contracts and proposals"""
        total_proposals = Proposal.objects.count()
        accepted_proposals = Proposal.objects.filter(
            status=Proposal.BidStatus.ACCEPTED
        ).count()
        proposals_with_contracts = Proposal.objects.filter(
            status=Proposal.BidStatus.ACCEPTED, contract__isnull=False
        ).count()
        proposals_without_contracts = accepted_proposals - proposals_with_contracts

        self.stdout.write("\n" + "=" * 50)
        self.stdout.write("CONTRACT CREATION SUMMARY")
        self.stdout.write("=" * 50)
        self.stdout.write(f"Total Proposals: {total_proposals}")
        self.stdout.write(f"Accepted Proposals: {accepted_proposals}")
        self.stdout.write(f"Proposals with Contracts: {proposals_with_contracts}")
        self.stdout.write(f"Proposals without Contracts: {proposals_without_contracts}")
        self.stdout.write("=" * 50 + "\n")
