# Known Issues and Gaps

Functional defects, gaps and inconsistencies found while documenting the system. Each was
identified by reading the code; runtime effects are inferred unless stated otherwise.
None of these has been fixed as part of the documentation work. Security-sensitive
findings are tracked privately (see [security.md](security.md#reporting-a-vulnerability)).

Use this list to plan work; remove entries as they are resolved.

- [Accounts](#accounts)
- [Jobs](#jobs)
- [Proposals and contracts](#proposals-and-contracts)
- [Milestones](#milestones)
- [Payments](#payments)
- [Chat, notifications, meetings](#chat-notifications-meetings)
- [Frontend](#frontend)
- [Operations and tooling](#operations-and-tooling)

## Accounts

| Issue | Evidence | Effect |
|---|---|---|
| Google sign-up does not create a `FreelancerProfile` or `ClientProfile`. | `accounts/serializers/*/signup_google.py` only create the user. | Features that read the profile (submitting proposals, contracts, chat, client profile) are expected to fail for these users. |
| Client Google sign-up requires a `student_id` (not stored) and an accepted university email domain; client email sign-up requires neither. | `accounts/serializers/clients/signup_google.py` vs `signup.py`. | Inconsistent client onboarding. Requires owner decision on intended rule. |
| Email verification links expire after 120 seconds by default. | `base.Settings.email_verify_timeout`. | Users who open the email later must request a new link (once). Adjustable in Django admin. |
| Updating a freelancer profile with a `freelancer_sub_profiles` list deletes any existing sub-profile not included in the list. | `accounts/serializers/freelancers/user_info.py#update`. | Because proposals and contracts cascade from the sub-profile, an incomplete PATCH can delete them. |
| `create_websocket_id` creates rows without a `notification_id`. | `accounts/management/commands/create_websocket_id.py`. | Affected users cannot use the notification WebSocket. |

## Jobs

| Issue | Evidence | Effect |
|---|---|---|
| Every PATCH of a draft or open job must include `status`. | `jobs/serializers/client/job.py#validate`. | Partial updates without `status` are rejected with a status error. |
| `privacy` is not used. | Not in the client serializer or any filter. | "Private" jobs would still be listed publicly. |
| Hourly-rate fields are not exposed to clients. | `ClientJobSerializer.Meta.fields`. | Hourly jobs cannot specify rates through the API. |
| Jobs never reach `completed` or `closed` through the API. | No code sets these statuses. | Admin action required. |

## Proposals and contracts

| Issue | Evidence | Effect |
|---|---|---|
| A client can set a `closed` (or `rejected`) proposal to `accepted` after another proposal was accepted. | `biding/serializers/client/proposal.py#save` only blocks changes to proposals already accepted. | A second contract is created for the same job and the first accepted proposal is set to `closed` while its contract remains active. |
| Freelancers can delete proposals in any status. | `ProposalSerializer.delete()` contains the "only pending" rule but DRF never calls it; the view's default `perform_destroy` is used. | Accepted proposals can be deleted, cascading to their contract. |
| No limit of one proposal per freelancer per job; `max_proposal_count` not enforced. | No constraint or validation. | Duplicate and unlimited proposals. |
| Connects are not implemented. | `available_connects` never changes; `ConnectUsage`/`ConnectHistory` are not registered models. | UI or business expectations around connects are not met. |
| Omitting `bid_amount` on a non-fixed job causes a server error. | `ProposalSerializer.validate` compares `None` with a decimal. | 500 instead of a validation message. |
| Proposal acceptance logic exists twice. | `biding/services.py` and `biding/serializers/client/proposal.py`. | Changes must be made in both places. |
| Changing a proposal attachment file calls `file.path`, which S3 storage does not support. | `biding/signals.py#delete_old_file_on_change`. | Replacing an attachment (e.g. via admin) is expected to fail. |
| Contracts never become `completed` or `cancelled` through the API. | No code sets these statuses. | Admin action required. |
| `create_contract --proposal-id` expects an integer but proposal IDs are UUIDs. | `biding/management/commands/create_contract.py`. | Only `--all` works. |

## Milestones

| Issue | Evidence | Effect |
|---|---|---|
| Step statuses `submitted` and `paid` are never set. | Freelancer serializer marks `status` read-only; client serializer rejects these values. | Upload does not move a step to `submitted`; nothing records payment. |
| A single step's amount must be strictly less than the contract budget. | `ClientMilestoneStepSerializer._validate_budget_constraints` (`amount >= budget` rejected). | A one-step plan for the full budget is impossible. Requires owner confirmation whether intended. |
| No endpoint deletes a step. | `MilestoneStepDetailView` allows PATCH only. | Admin action required. |
| Frontend calls non-existent `…/submissions/…` endpoints. | See [frontend.md](frontend.md#known-frontendbackend-mismatches). | Submission history / review actions in the contract page are expected to fail. |

## Payments

| Issue | Evidence | Effect |
|---|---|---|
| A successful payment does not mark the client as payment-verified or change the job. | Commented-out code in `payments/signals.py`. | "Payment verified" badges never change through payment. |
| The amount charged is `int(job.min_budget)`. | `payments/utils.py#_initiate_payment_payload`, `views/job_payment.py`. | Decimals are truncated; hourly or ranged jobs are charged the minimum budget, not an accepted bid. |
| Callback with an unknown invoice number or without `status` raises an unhandled error. | `payments/views/callback_payment.py`. | 500 response instead of a redirect. |
| Only the first callback per payment request is logged. | `PaymentCallbackLog.objects.get_or_create`. | Later callbacks (e.g. retry after failure) are not recorded, though the transaction is still re-verified. |
| The callback redirect is a permanent (301) redirect. | `HttpResponsePermanentRedirect`. | Browsers may cache it; a temporary redirect is more appropriate. |
| Callback status values (`SUCCESSFUL`) differ from transaction status values (`SUCCESS`). | `PaymentCallbackLog` vs `PaymentTransaction` choices; `payments/signals.py`. | Transaction briefly holds a value outside its choices until the status check overwrites it. |

## Chat, notifications, meetings

| Issue | Evidence | Effect |
|---|---|---|
| Each new chat message broadcasts the latest 50 messages, each with seen-list queries. | `chat/consumers.py#handle_message`. | Unnecessary load per message. |
| `Message.is_read` is a single flag for both parties. | `chat/models.py`. | Read state is approximate; per-party timestamps exist alongside it. |
| `MeetingHistory.left_at` is `auto_now`. | `meeting/models.py`. | It does not record when a user left. |
| Meeting times are not enforced. | `JoinMeetingView`. | Users can join any time. |

## Frontend

| Issue | Evidence | Effect |
|---|---|---|
| No token refresh and no server-side logout. | No calls to `token/refresh/` or `logout/`. | Users are signed out when the access token expires; refresh tokens stay valid after sign-out. |
| `proxy.ts` performs no checks. | `client/src/proxy.ts`. | Route protection is client-side only. |
| Admin "Reports" and "Settings" pages are static placeholders. | `app/admin/reports`, `app/admin/settings`. | No real data or effect. |
| `npm run lint` uses `next lint`, removed in Next.js 16. | `client/package.json`. | Lint script likely fails. |
| `profileService.ts` uses non-existent `/api/...` paths. | `client/src/services/profileService.ts`. | Affected profile URL helper calls fail. |
| `NEXT_PUBLIC_BASE_URL` is documented in examples but unused. | `client/src/lib/appUrl.ts`. | Misleading configuration. |
| Landing-page FAQ promises escrow, payouts and a service fee. | `client/src/app/page.tsx`. | Not implemented (see [features.md](features.md#not-implemented)). |

## Operations and tooling

| Issue | Evidence | Effect |
|---|---|---|
| No automated tests and no CI test/lint stage. | Empty `tests.py` files; `Jenkinsfile`. | Regressions are only caught manually. |
| Jenkins detects changes only in the last commit on `main`. | `Jenkinsfile` "Detect Changes". | Multi-commit pushes may skip rebuilding changed services. |
| Several staging services have no restart policy. | `compose.staging.yaml`. | They stay down after a crash or host reboot. |
| `collectstatic` is never run although staging static storage is MinIO. | Start scripts. | Admin/Swagger static assets may be missing (not verified). |
| No scheduled or off-host backups. | Only manual scripts. | Risk of data loss. |
| `server/compose/local/.env.example` lacks `SECRET_KEY` and uses a MinIO host name that does not match Compose. | File content. | Local setup fails until corrected (workaround in [development.md](development.md)). |
| Backup script usage text names the service `postgres`; it is `db`. | `database/postgres/compose/staging/maintenance/*`. | Copy-pasted commands fail. |
| `make test` needs `coverage`, which is not in any requirements file. | `server/Makefile`, `server/requirements/`. | Command fails in a fresh environment. |
| `client/src/**/README.md` files were not verified. | – | May describe outdated behaviour. |
