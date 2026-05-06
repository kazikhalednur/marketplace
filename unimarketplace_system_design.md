# UniMarketplace — Deep System Design & Architecture Document

> Bangladesh-based, university-only entry-level talent marketplace.
> This document is an opinionated, production-grade design built on top of the existing Django + Next.js + Postgres + Redis + MinIO + Jitsi codebase, and extends it into a regulated, fintech-grade marketplace.

**Author role assumed:** Senior PM + Fintech System Architect + Marketplace Strategist.
**Reading mode:** Deep analysis, not a summary. Each section is meant to be implementable.

---

## 0. Executive Snapshot

| Aspect | Decision |
|---|---|
| Target users | University students + fresh graduates (≤ 24 months post-graduation) in Bangladesh |
| Verification | Phase 1: `.edu`/`.edu.bd`/whitelisted university email + OTP → Phase 2: Student ID + selfie liveness → Phase 3: NID + bKash KYC tie-in |
| Currency | BDT (primary), USD (display-only later for foreign clients) |
| Payments in | bKash, Nagad, Rocket, Card (SSLCommerz/ShurjoPay/AamarPay), Bank transfer |
| Payments out | bKash payout, Nagad payout, Bank (BEFTN/NPSB), manual hold for high-risk |
| Money model | **Double-entry ledger + escrow holds**, never trust raw gateway state |
| Commission | 20% base, with discount tiers; plus boost/feature/subscription revenue |
| Trust loop | Verification × Reputation × Reliability × Dispute history → composite "TrustScore" |
| Compliance posture | Build with Bangladesh Bank PSP/PSO/MFS guidelines in mind even before licensing — partner-led model initially |

**Strategic positioning:** Not "Upwork for Bangladesh." Position as the **verified-only entry-level talent layer** — the bridge between university and industry. Defensible moat = identity + reliability scoring, not feature count.

---

## 1. FULL SYSTEM ANALYSIS

### 1.1 Decomposition into Core Systems

| # | System | Subsystems | Status in current code | Gap |
|---|---|---|---|---|
| 1 | **Identity & Trust** | Auth, .edu verification, NID/KYC, liveness, device fingerprint, sanctions/PEP screen | JWT + email verify + Google OAuth ✅ | No NID, no liveness, no device binding, no university whitelist registry |
| 2 | **Marketplace Core** | Jobs, categories, skills, proposals, contracts, milestones | ✅ Mostly built | Proposal ranking, anti-spam, budget validation, skill taxonomy versioning |
| 3 | **Work Execution** | Milestones, steps, work diary, deliverables, time tracking | Partial ✅ | Proof-of-work artifacts, plagiarism/AI-content checks, version history |
| 4 | **Communication** | Chat, notifications, meetings | ✅ Built (Channels + Jitsi) | Pre-bid restricted chat, leakage prevention (contact info filter), meeting recordings + retention |
| 5 | **Fintech Core** | Wallet, ledger, escrow, fees, payouts, reconciliation | Stub: payment request/callback only ❌ | Almost everything below — must be rebuilt as a true ledger |
| 6 | **Risk & Fraud** | Rules engine, velocity checks, multi-account detection, ML scoring | ❌ Missing | Greenfield work |
| 7 | **Disputes & Moderation** | Tickets, evidence locker, SLAs, decisions, appeals | ❌ Missing | Add as first-class system |
| 8 | **Reputation** | Reviews, TrustScore, reliability, badges | ❌ Missing | Build dual-sided review + composite scoring |
| 9 | **Discovery** | Search, recommendation, ranking | Filters only | Need vector + behavioral signals later |
| 10 | **Ops & Admin** | Back-office, audit, support tooling, analytics | Admin Next.js app + admin-api ✅ | Add dispute desk, ledger viewer, fraud queue, payout console |
| 11 | **Platform Plumbing** | Observability, secrets, queues, schedulers, feature flags | Compose stack ✅, partial Celery | Need metrics/tracing, feature flags, structured logs |
| 12 | **Compliance** | KYC records, AML alerts, data retention, consent, DSR | ❌ Missing | Required before scale |

### 1.2 Missing Components Not Mentioned in the Brief

These are **silent failures** if not built:

1. **University registry service** — a curated list of recognized BD universities with allowed domains, alumni rules, and graduation cohort metadata. Without this, `.edu` validation is meaningless (Bangladesh has many universities using `.edu.bd`, `.ac.bd`, custom domains, and even `gmail.com` for staff).
2. **Skill taxonomy + versioning** — skills change; you need a controlled vocabulary, synonyms, and category hierarchy.
3. **Idempotency layer** for all payment / wallet APIs (Idempotency-Key header).
4. **Outbox pattern** for cross-service consistency (especially payments → ledger → notifications).
5. **Reconciliation engine** between gateway statements and internal ledger.
6. **Settlement clock** — daily T+0/T+1 cycle, not on-demand.
7. **Sanctions / PEP / blacklist** screening hook (lightweight, can use internal blocklist initially).
8. **Tax & TIN handling** — once payouts cross thresholds, NBR may apply withholding.
9. **Data retention & DSR** — you will hold student PII; you need delete/export flows.
10. **Operational runbooks** — gateway outage, queue backlog, ledger imbalance, suspicious payout.

### 1.3 Risk Matrix

| Risk class | Specific risk | Likelihood | Impact | Primary mitigation |
|---|---|---|---|---|
| **Identity** | Fake students using leaked .edu emails | High | High | Liveness + student ID OCR + cohort cross-check |
| **Identity** | Multi-account / Sybil | High | High | Device fingerprint + phone+NID dedupe + behavioral graph |
| **Fintech** | Gateway callback spoofing | Medium | Critical | Signature verification + idempotency + server-side state machine |
| **Fintech** | Double release of escrow | Low | Critical | Ledger-level locks + state machine + idempotency keys |
| **Fintech** | Chargeback abuse (card) | Medium | High | Hold escrow until completion + delayed payout window |
| **Fintech** | Withdrawal abuse / mule accounts | Medium | High | Velocity rules + matching name on payout method + cooling-off |
| **Operational** | Off-platform deal (commission leakage) | Very High | High | Pre-bid chat scrubbing + rep penalties + payment-on-platform incentives |
| **Operational** | Dispute backlog | High | Medium | SLA timers + automated tier-1 + tiered escalation |
| **Quality** | Low-quality work / ghosting students | High | Medium | Reliability score + auto-suspend thresholds |
| **Legal** | Unlicensed money handling | Medium | Critical | Partner-led PSP model; clear ToS; segregated client funds |
| **Security** | Data breach (PII + NID images) | Medium | Critical | Encrypt at rest, segregated KYC store, short-lived URLs |
| **Scalability** | Hot job posts (millions of bids) | Low early | Medium | Bid caps + rate limits + pagination |
| **Reputation** | Review bombing / collusion rings | Medium | Medium | Graph anomaly detection + verified-contract-only reviews |

---

## 2. COMPLETE SYSTEM DESIGN

### 2.A High-Level Architecture

```
                        ┌──────────────────────────────────────┐
                        │              END USERS               │
                        │  Students  •  Clients  •  Admins     │
                        └──────────────────────────────────────┘
                                        │
                ┌───────────────────────┼─────────────────────────┐
                │                       │                         │
        ┌───────▼───────┐       ┌───────▼────────┐        ┌───────▼────────┐
        │ Web (Next.js) │       │ Mobile (RN/Exp)│        │ Admin (Next.js)│
        │  user app     │       │  user app      │        │  back-office   │
        └───────┬───────┘       └───────┬────────┘        └───────┬────────┘
                │                       │                         │
                └───────────────┬───────┴─────────────────────────┘
                                │ HTTPS (TLS 1.3)
                       ┌────────▼─────────┐
                       │   NGINX / WAF    │  rate-limit, headers, TLS
                       └────────┬─────────┘
                                │
                       ┌────────▼──────────┐
                       │   API Gateway     │  auth, routing, idempotency
                       │ (DRF + middlewares│
                       │  + JWT + ASGI)    │
                       └────────┬──────────┘
                                │
   ┌───────────┬─────────────┬──┴─────────┬──────────────┬──────────────┐
   │           │             │            │              │              │
┌──▼───┐  ┌────▼────┐   ┌────▼────┐  ┌────▼────┐    ┌────▼─────┐  ┌─────▼──────┐
│Accts │  │ Jobs &  │   │ Bidding │  │  Work   │    │ Wallet & │  │  Disputes  │
│ /KYC │  │Catalog  │   │/Contract│  │ Diary   │    │  Escrow  │  │ /Moderation│
└──┬───┘  └────┬────┘   └────┬────┘  └────┬────┘    └────┬─────┘  └─────┬──────┘
   │           │             │            │              │              │
┌──▼───┐  ┌────▼────┐   ┌────▼────┐  ┌────▼────┐    ┌────▼─────┐  ┌─────▼──────┐
│Reput.│  │Search & │   │Messaging│  │Meetings │    │ Payments │  │   Fraud    │
│Trust │  │Recommend│   │ (Chat)  │  │ (Jitsi) │    │  Adapter │  │  Engine    │
└──┬───┘  └────┬────┘   └────┬────┘  └────┬────┘    └────┬─────┘  └─────┬──────┘
   │           │             │            │              │              │
   └───────────┴─────────────┴───────┬────┴──────────────┴──────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
       ┌──────▼─────┐          ┌─────▼──────┐         ┌─────▼─────┐
       │ PostgreSQL │          │   Redis    │         │   MinIO   │
       │  primary + │          │ cache +    │         │ S3-compat │
       │ read repl. │          │ pub/sub +  │         │  media +  │
       │ (OLTP)     │          │ Channels + │         │  KYC vault│
       │            │          │ Celery brk │         │ (separate)│
       └──────┬─────┘          └────────────┘         └───────────┘
              │
       ┌──────▼─────┐          ┌────────────┐         ┌───────────┐
       │  ClickHouse│          │ Vector DB  │         │ Object    │
       │ /BigQuery  │          │ (pgvector  │         │ archival  │
       │ (analytics │          │  later)    │         │ (cold)    │
       │  warehouse)│          └────────────┘         └───────────┘
       └────────────┘

                    ┌──────────────────────────────┐
                    │   ASYNC / BACKGROUND PLANE   │
                    │  Celery workers • Beat       │
                    │  Outbox dispatcher           │
                    │  Reconciliation job          │
                    │  Payout job                  │
                    └──────────────────────────────┘

 ┌──────────────────── EXTERNAL SYSTEMS ────────────────────┐
 │ bKash API • Nagad API • SSLCommerz • ShurjoPay •         │
 │ Bank BEFTN/NPSB • SMS gateway (Twilio/SSL Wireless) •    │
 │ Email (SES/Postmark) • OCR/Liveness (Smile / IDfy /      │
 │ in-house) • Sentry • Grafana/Loki • Object storage cold  │
 └──────────────────────────────────────────────────────────┘
```

#### Frontend
- **Web (Next.js App Router):** existing — keep. Add: KYC step UI, wallet UI, dispute UI, ledger statement, payout request, OTP+device verification.
- **Mobile (Expo / React Native):** Phase 2. Reuse RTK Query API contracts. Critical for students (mobile-first BD market).
- **Admin (Next.js):** existing — extend with Dispute Desk, Ledger Viewer, Payout Console, Fraud Queue, KYC Review Queue.

#### Backend (services / modules — start as Django apps, split later)
- `accounts` (existing) → add `kyc`, `verification`, `devices`
- `jobs`, `biding`, `work_diary` (existing) → harden state machines
- `payments` (existing) → split into `wallet`, `ledger`, `escrow`, `payments_gateway`, `payouts`
- New apps: `disputes`, `reputation`, `risk`, `notifications_pref`, `admin_ops`, `analytics_events`

#### Database
- **PostgreSQL (OLTP):** users, jobs, contracts, ledger, escrow, disputes, reputation. Use **schemas** to isolate concerns (`core`, `ledger`, `risk`).
- **Redis:** cache, channels, Celery broker, rate limits, OTP store (with TTL), idempotency keys, leaderboard cache.
- **MinIO/S3:** general media + a **separate KYC bucket** with stricter IAM and short-lived presigned URLs.
- **Analytics warehouse (later):** ClickHouse or BigQuery via CDC (Debezium) for events, funnels, cohort analysis.
- **Vector store (later):** pgvector inside Postgres for proposal/job semantic ranking before standing up a separate service.

#### Payment Integration Layer (BD-focused)
- Adapter pattern, one interface, multiple drivers:
  - `bkash` (tokenized + checkout)
  - `nagad`
  - `rocket`
  - `sslcommerz` / `shurjopay` / `aamarpay` (cards + aggregator)
  - `bank_beftn` (manual/operator-initiated payouts)
- Every payment touches the **ledger** before it's "real". Gateway callbacks only **propose** state changes.

#### Notification System
- Channels: in-app (WebSocket), email, SMS, push (FCM later).
- Per-user channel preferences + frequency caps (anti-spam to users).
- Templated, localized (Bangla + English).
- Driven by domain events on the **outbox**.

#### Queue System (async jobs)
- **Celery** (already configured). Recommended queues:
  - `default`, `email`, `sms`, `payments`, `payouts`, `reconciliation`, `risk`, `notifications`, `analytics`, `media`.
- Beat schedule: nightly reconciliation, hourly payout batch, 15-min risk scoring, daily reputation recompute, JWT blacklist cleanup, KYC expiry checks.
- **Outbox dispatcher** consumes `outbox_event` table → publishes to handlers (avoids dual-write bugs between DB and queue).

### 2.B Core Modules — Expanded

#### B.1 Authentication & Verification (future-proof KYC)
**Layered identity model — each layer unlocks more capability.**

| Tier | Required | Capabilities | Limits |
|---|---|---|---|
| L0 — Anon | none | Browse | none |
| L1 — Email | Email + password / Google | Account creation, profile draft | Cannot bid / cannot post |
| L2 — Student-verified | University email OTP + university whitelist match | Bid up to 5 active proposals | Wallet capped at BDT 5,000 |
| L3 — ID-verified | Student ID upload + selfie liveness + cohort check | Unlimited bids, take contracts | Wallet capped at BDT 50,000 |
| L4 — KYC-verified | NID + phone + bKash/bank match | Withdraw to MFS/bank | Wallet uncapped (subject to AML) |
| L5 — Trusted | L4 + tenure + clean record | Lower fees, priority support, early features | — |

**Concrete checks:**
- **University whitelist registry** (`university_registry` table): approved domain patterns, university name, country, alumni grace period.
- **OCR + liveness:** integrate a vendor (Smile ID / IDfy) or build a lightweight in-house service using Tesseract + a face-matching model. Store original docs in **encrypted KYC bucket**, store only OCR-extracted fields + a hash in DB.
- **Device fingerprint:** FingerprintJS Pro (or open source) → bind device → flag if same device has many accounts.
- **Phone OTP:** SMS via SSL Wireless / Banglalink. Store hashed.
- **Graduation rule:** profile must declare graduation year; account auto-downgrades after `grad_year + 24 months` unless upgraded path is taken (future "alumni mentor" tier).

**Anti-bypass measures:**
- Rate-limit account creations per IP, per device, per phone.
- Block disposable email providers.
- Rejected `.edu` domains require manual admin review.
- NID number deduped — same NID cannot have two student accounts.

#### B.2 Wallet & Escrow (see deep section §3 — this is the heart)

#### B.3 Proposal Ranking (anti-spam + scoring)
Every job's proposal list is ordered by a **composite proposal score**, not by time. Time is only a tiebreaker.

```
score = w1*relevance + w2*trust + w3*reliability + w4*price_fit
        + w5*responsiveness + w6*portfolio_match
        − p1*spam_signal − p2*recent_violations − p3*off_platform_intent
```

- `relevance`: cosine similarity between job text and proposal text + skill overlap (start with TF-IDF, upgrade to embeddings).
- `trust`: from §B.6 TrustScore.
- `reliability`: completion rate, on-time rate, response time.
- `price_fit`: distance from client's budget midpoint, normalized.
- `responsiveness`: median chat reply time over last 30 days.
- `portfolio_match`: number of past contracts in the same category.
- **Spam signals**: identical proposal text reused (cosine ≥ 0.9 across N jobs), keyword-stuffed, very long generic templates, contains contact info or external links → demoted hard.
- **Off-platform intent**: regex + classifier flags ("WhatsApp me", phone numbers, email addresses, "outside the platform", "direct payment") → demoted + warning + repeat = ban.

**Quotas to kill spam:**
- L2 users: ≤ 8 active proposals; ≤ 20 sent in 24h.
- Each new proposal must be ≥ 80 chars, ≤ 95% similar to that user's last 10 proposals.
- Proposals on jobs older than 14 days are auto-deprioritized.

#### B.4 Dispute Resolution (admin tooling)
**State machine:**
```
opened → evidence_gathering → admin_review
       → mediation_offered → mediation_accepted | mediation_rejected
       → admin_decision (refund | release | partial_split) → closed
       → optional appeal (one-time, with new evidence)
```

**Admin Dispute Desk features:**
- Side-by-side timeline (chat, milestones, deliverables, ledger entries).
- Evidence locker (immutable, signed URLs).
- Templates for decisions.
- Decision splits expressed as **ledger journal** templates (no free-form money moves).
- SLA timers per state with auto-escalation.
- Audit trail: who saw what, who decided, why.

**Automation seeds (for future):**
- Auto-mediation suggestion: based on milestone completion %, refund X%.
- "No-response" automation: if client silent 7 days post-delivery → auto-release.
- "No-delivery" automation: if student silent 7 days post-deadline → auto-refund.

#### B.5 Reputation & Trust Scoring
**Two outputs, separate concepts:**
- **Public Rating** (1–5 stars, both sides) — a user-facing review.
- **TrustScore** (0–1000, internal + lightly public) — composite, used in ranking.

```
TrustScore = baseline(verification_tier)
           + α * weighted_avg_rating (Bayesian, recency-weighted)
           + β * completion_rate
           + γ * on_time_rate
           + δ * tenure_factor
           + ε * dispute_win_rate (capped)
           − ζ * dispute_loss_rate
           − η * violations
           − θ * inactivity_decay
```

- **Bayesian average** (so a user with 1×5★ doesn't outrank one with 50×4.8★).
- **Recency weighting**: last 90 days count 2× older.
- **Decay**: stale accounts drift toward neutral.
- **Reciprocity guard**: a review is only counted if the contract was **fully paid out via the platform** (kills off-platform fake reviews).
- **Anti-collusion**: detect rings via graph (frequent pairs, IP/device overlap, suspiciously high mutual ratings) → review weight set to 0.

#### B.6 Fraud Detection Layer
**Phase 1 — Rules engine** (deterministic, explainable):
- New account + immediate withdrawal → block.
- Same NID/phone/device on N accounts → flag.
- Sudden large escrow + same-day client + student known to each other (graph signal) → flag.
- Withdrawal to a different name than KYC → block.
- IP geo mismatch (BD account from sanctioned/unusual country) → step-up auth.
- Velocity: > N proposals/min, > X BDT/day.

**Phase 2 — ML scoring** (after enough data):
- Gradient boosted tree on labeled fraud cases (chargebacks, confirmed scams, banned users).
- Real-time feature store (Redis-backed) for last-N-events features.
- Output: `risk_score 0–100` per event → routes to allow / step-up / hold / block.

**Architecture:** publish events to `risk` queue → risk service evaluates → writes verdict back → action service enforces.

#### B.7 Smart Matching / Recommendations
- **Phase 1:** rule-based — match job skills to student skills, rank by TrustScore.
- **Phase 2:** content embeddings (pgvector) — semantic similarity between job descriptions and student bios/portfolios.
- **Phase 3:** behavioral — collaborative filtering on "clients who hired X also liked Y."
- **Cold start:** new student → recommend low-stakes "starter jobs" tagged for newcomers; new client → show portfolio-rich verified students.

#### B.8 Messaging — controlled pre-bid chat
- **Pre-bid (no contract yet):** restricted — system filters out phone numbers, emails, external URLs, payment app names. Replaces them with `[redacted by UniMarketplace]` and warns the sender. Repeated attempts → strike.
- **Post-contract:** full chat, file sharing allowed, but contact-info filter still warns (educates users). All retained.
- **Realtime:** Channels (already in place). Add: typing indicators, read receipts (already), per-message E2E NOT used (because moderation/dispute requires server visibility — be transparent in ToS).
- **Retention:** chats kept for life of contract + 12 months for dispute support, then archived.

---

## 3. WALLET & ESCROW — DEEP FINTECH DESIGN

This section is the core of UniMarketplace's defensibility. **Never** treat the gateway as the source of truth.

### 3.1 Principles
1. **Single source of truth = internal ledger.** Gateways propose, ledger disposes.
2. **Double-entry**: every money movement = ≥ 2 balanced postings (debits = credits).
3. **Immutability**: ledger entries are append-only. Corrections are reversing entries, never edits.
4. **Idempotency** on every money-touching API (`Idempotency-Key` header → stored 24h).
5. **State machines** with explicit allowed transitions; no free-form updates.
6. **Segregation of duties**: separate "client funds" liability from "platform revenue".
7. **Reconcile daily** against gateway statements; alert on any mismatch.

### 3.2 Ledger Model (Double-Entry)

**Core tables (in `ledger` schema):**

```
accounts (
  id BIGSERIAL PK,
  owner_type ENUM('user', 'platform', 'gateway', 'escrow', 'fees', 'tax', 'suspense'),
  owner_id BIGINT NULL,                -- user id or null for platform accounts
  account_type ENUM('available','pending','escrow_hold','revenue','fees',
                    'tax_withheld','gateway_settlement','suspense','rounding'),
  currency CHAR(3) DEFAULT 'BDT',
  status ENUM('active','frozen','closed'),
  created_at, updated_at,
  UNIQUE (owner_type, owner_id, account_type, currency)
)

journal_entries (                      -- the "transaction" container
  id BIGSERIAL PK,
  external_ref VARCHAR(64) UNIQUE,     -- idempotency / business reference
  type ENUM('deposit','escrow_fund','escrow_release','escrow_refund',
            'fee_charge','tax_withhold','payout','reversal','adjustment',
            'chargeback','correction'),
  status ENUM('pending','posted','reversed'),
  metadata JSONB,
  created_by ENUM('system','admin','user'),
  created_at TIMESTAMPTZ NOT NULL
)

postings (                              -- the "lines" — must balance per entry
  id BIGSERIAL PK,
  journal_entry_id BIGINT FK,
  account_id BIGINT FK,
  direction ENUM('debit','credit'),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency CHAR(3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
)
-- Invariant (enforced by trigger or service): for any entry,
-- sum(debits) == sum(credits) per currency.

balances_cache (                        -- materialized for fast reads
  account_id BIGINT PK,
  balance NUMERIC(18,2) NOT NULL,
  as_of TIMESTAMPTZ NOT NULL
)
```

**Account taxonomy per actor:**
- Each **user** has: `available`, `pending`, `escrow_hold` accounts.
- **Platform** has: `revenue` (commission income), `fees` (boost, sub), `tax_withheld`, `promo_payable` (promo credits liability), `suspense` (uncategorized).
- Each **gateway** has a `gateway_settlement` (asset) account (mirrors what they owe us).
- A global `rounding` account absorbs sub-paisa rounding.

### 3.3 Standard Journal Entries (templates)

Every business event maps to **one** of these templates. No ad-hoc journals.

**1) Client deposit via bKash (BDT 10,000):**
```
DR  gateway_settlement[bKash]            10,000
    CR  user.available[client_id]            10,000
```

**2) Fund escrow for contract (client moves 10,000 to escrow hold):**
```
DR  user.available[client_id]            10,000
    CR  user.escrow_hold[contract_id]        10,000
```
*(Convention: escrow_hold can be modeled as a per-contract account or a sub-balance under client. Per-contract is cleaner.)*

**3) Release milestone (8,000 to student, 2,000 fee = 20%):**
```
DR  user.escrow_hold[contract_id]        10,000
    CR  user.available[student_id]            8,000
    CR  platform.revenue                      2,000
```

**4) Refund milestone (full):**
```
DR  user.escrow_hold[contract_id]        10,000
    CR  user.available[client_id]            10,000
```

**5) Partial split decided in dispute (60% release, 40% refund, fee charged on released portion only):**
```
DR  user.escrow_hold[contract_id]        10,000
    CR  user.available[student_id]            4,800   -- 6000*0.8
    CR  platform.revenue                      1,200   -- 6000*0.2
    CR  user.available[client_id]             4,000
```

**6) Withdrawal (student → bKash payout 5,000, with 2% payout fee absorbed by student):**
```
DR  user.available[student_id]            5,000
    CR  gateway_settlement[bKash]             4,900
    CR  platform.fees                           100
```

**7) Failed payment (deposit init but gateway timeout / failed verify):**
- No journal posted at init.
- On confirmed failure → no entries.
- On confirmed success → entry #1 posted.

**8) Reversal / chargeback:**
```
-- Original: entry #1 (deposit)
-- Chargeback: post a reversal entry
DR  user.available[client_id]            10,000
    CR  gateway_settlement[bKash]            10,000
-- If funds already moved to escrow / paid out: chase from suspense, freeze account.
```

### 3.4 Escrow Lifecycle (state machine)

```
            ┌──────────┐
            │ DRAFT    │  proposal accepted, contract created, no money yet
            └────┬─────┘
                 │ client deposits / has wallet balance
                 ▼
            ┌──────────┐
            │ FUNDED   │  funds in escrow_hold[contract]
            └──┬──┬────┘
               │  │
   delivery    │  │ cancel before work
   submitted   │  │
               ▼  ▼
        ┌─────────────┐
        │ IN_REVIEW   │
        └──┬──┬──┬────┘
           │  │  │
   approve │  │  │ dispute
           │  │  ▼
           │  │  ┌──────────┐
           │  │  │ DISPUTED │
           │  │  └────┬─────┘
           │  │       │ admin/auto decision
           │  │       ▼
           │  │  ┌────────────────┐
           │  │  │ DECIDED_SPLIT  │
           │  │  └────────┬───────┘
           │  │           │
           ▼  ▼           ▼
        ┌─────────┐   ┌──────────┐
        │RELEASED │   │ REFUNDED │
        └─────────┘   └──────────┘

           Side: AUTO_RELEASE after N days of client silence post-delivery
```

**Allowed transitions (single source of truth):**

| From | To | Trigger | Who |
|---|---|---|---|
| DRAFT | FUNDED | Funding accepted by ledger | client / system |
| FUNDED | IN_REVIEW | Student submits deliverable | student |
| FUNDED | REFUNDED | Client cancels w/ student consent or before work | client/admin |
| IN_REVIEW | RELEASED | Client approves OR auto-release timer | client / system |
| IN_REVIEW | DISPUTED | Either party opens dispute | both |
| DISPUTED | DECIDED_SPLIT / RELEASED / REFUNDED | Admin/auto decision | admin |
| Any | FROZEN | Risk/admin intervention | admin |

### 3.5 Partial Milestone Release
- A contract is composed of **milestones**, each with its own escrow sub-hold.
- Funding is per-milestone (preferred) or per-contract (with internal allocation).
- Each milestone has its own state machine instance.
- Releasing milestone M does **not** require completing M+1.
- Fee is charged proportionally per release.
- Implementation: a `milestone_escrow` account per `(contract_id, milestone_id)`.

### 3.6 Failed Payments — Defensive Design

Common cases and the right response:

| Scenario | Symptom | Right behavior |
|---|---|---|
| Gateway timeout, no callback | Pending init forever | Background job polls gateway status API every X mins for up to T hours; then mark `failed` |
| Callback arrives but signature invalid | Possible spoof | Reject, alert security |
| Callback says success, but our reconciliation finds no money | Possibly fake | Don't credit until reconciliation matches gateway statement |
| Callback says failed, but money actually moved (rare) | Mismatch | Reconciliation flags it; ops manually credits with audit |
| Duplicate callback | Idempotency key match | Return prior result, do nothing |
| Client double-clicks / retries | Multiple init requests | Same idempotency key → one logical attempt |

**Rule:** A user-visible balance change happens only after a journal entry is posted, which only happens when callback **and** internal validation **and** (for high amounts) reconciliation match.

### 3.7 Withdrawal Flow

**Tiers based on TrustScore + KYC:**
- L4 + clean → automated payouts via bKash B2C / bank API, instant or T+0 batch.
- L4 + risk flags → held for manual review (max 24h SLA).
- Below L4 → no withdrawal.

**Steps:**
1. Student requests payout: amount, destination (must be in payout method registry, validated).
2. Pre-checks: KYC tier, balance, daily/weekly velocity, name match between KYC and destination, no pending disputes.
3. Risk score on the request → allow / hold / deny.
4. Reserve funds: post a "payout_pending" journal that moves from `available` to `payout_in_flight` (suspense sub-account).
5. Submit to gateway / bank.
6. On success callback → finalize journal, notify user.
7. On failure → reverse the reservation, notify user, log reason.
8. **Cooling-off**: first payout after KYC has a 24h delay (anti-fraud).
9. **Threshold**: large payouts > BDT 50,000/day require manual approval.

### 3.8 Reconciliation System

**Daily job:**
- Pull statement from each gateway (CSV / API).
- For each gateway txn → match against `journal_entries.external_ref`.
- Three buckets:
  - **Matched** → mark reconciled.
  - **In gateway, not in us** → suspense investigation.
  - **In us, not in gateway** → suspense investigation.
- Auto-create `reconciliation_exception` rows. Ops dashboard shows them.
- Hard alert if total mismatch > BDT threshold or > N items.

**Tables:**
```
gateway_statements (id, gateway, period_start, period_end, file_ref, raw_count, raw_total)
gateway_txns (id, gateway, gateway_txn_id UNIQUE, type, amount, fee, when, raw)
recon_matches (gateway_txn_id, journal_entry_id, status, matched_at)
recon_exceptions (id, gateway_txn_id NULL, journal_entry_id NULL, reason, status, resolved_by)
```

### 3.9 Audit Logs for Every Transaction

- **Immutable** `audit_log` table (append-only, hash-chained for tamper evidence): `(id, prev_hash, hash = sha256(prev_hash + payload))`.
- Every money-related action writes one row: actor, action, resource, before/after (relevant fields), IP, device, request id.
- Periodically dump to cold storage for long-term retention.
- Admin UI shows the chain; mismatched hash flags tampering.

### 3.10 Compliance Posture (BD-specific notes)

- **Bangladesh Bank** regulates MFS and PSP/PSO. Until you have a license, **partner under a licensed PSP / aggregator** (SSLCommerz, ShurjoPay) which already holds BB authorization. You become a merchant with a sub-merchant model for student payouts.
- **Segregated client funds** mindset: in your books, `user.available` is your liability to the user. Don't co-mingle with platform revenue.
- **NBR / TDS:** for student earnings above thresholds, you may need to deduct withholding tax. Build `tax_withheld` account from day 1.
- **Data Protection (BD Personal Data Protection Act, drafts):** treat NID images as sensitive; encrypt at rest with separate KMS keys.

---

## 4. USER FLOW DESIGN — Step by Step

### 4.A Student (Freelancer)

1. **Signup**
   - Enter email (must match university registry pattern) + name + password OR Google OAuth.
   - System sends **email OTP**; verifying lifts to L1 + tags `student_email_verified`.
2. **Phone OTP** (required to bid)
   - 6-digit SMS OTP, 5-min TTL, max 5 attempts. Phone deduped against existing users.
3. **Profile build**
   - Required: full name (must match future KYC), university, department, intake year, expected grad year, headline, bio, skills (≥3, ≤15), spoken languages.
   - Optional: portfolio links, GitHub, Behance, certifications.
4. **Student verification (L2 → L3)**
   - Upload student ID (front+back). OCR extracts: name, ID number, university, validity.
   - Liveness selfie. Face match vs ID photo (≥ threshold).
   - Cohort cross-check (university + intake year reasonable).
   - Auto-approve if all pass; queue for manual review otherwise.
5. **Wallet & KYC (L4)** — required only for withdrawal
   - NID front+back + selfie liveness.
   - bKash/bank account number; name match against NID.
   - Background risk check.
6. **Browse & bid**
   - Filter jobs by category, skill, budget, deadline, university preference (some clients restrict to a uni).
   - Submit proposal: cover letter, proposed price, milestones (suggested), delivery time.
   - System runs anti-spam + off-platform-intent checks → may block or warn.
7. **Contract formation**
   - Client accepts → contract status `OFFER_SENT`.
   - Student accepts terms + milestones → `ACCEPTED`.
   - Client funds escrow → `ACTIVE`.
8. **Work**
   - Work diary entries per milestone step.
   - Attach deliverables (versioned in MinIO).
   - Optional milestone meetings via Jitsi.
9. **Submit deliverable**
   - Marks milestone `IN_REVIEW`. Auto-release timer starts (e.g., 7 days).
10. **Payment**
    - On client approve OR auto-release → escrow releases minus fee → `available` balance.
11. **Withdrawal**
    - Pick destination (registered payout method) → submit → KYC + risk check → settled to bKash/bank.
12. **Review**
    - Mutual review window opens after release; reviews public, weighted into TrustScore.

### 4.B Client (Employer)

1. **Signup**
   - Email + password / Google. Email verified.
   - **Client KYC (lighter)**: business name (or individual), phone OTP, optional NID, optional company info, billing address.
2. **Job posting**
   - Title, category, skills, scope, budget (fixed or hourly), deadline, milestones (optional draft), attachments, NDA flag, university restriction (optional).
   - **Budget validation**: system checks budget vs category baseline; sub-floor budgets get a warning ("This is below 90% of similar jobs and may not attract quality students").
   - **Posting fee**: free for first N posts/month; small fee or boost upsell after.
   - Pre-publish anti-fraud: new clients with no payment method can't post jobs above BDT X.
3. **Reviewing bids**
   - List sorted by **proposal score** (§B.3), not time.
   - Shortlist, message (pre-bid restricted chat), schedule interview meeting (Jitsi).
4. **Hiring**
   - Send offer to chosen student → contract goes `OFFER_SENT`.
5. **Escrow funding**
   - Client tops up wallet via bKash/Nagad/card or pays directly into the contract escrow.
   - Until escrow is funded, the student is not obligated to start.
6. **Delivery & feedback**
   - Review submission. Approve, request changes (within revision policy), or open dispute.
7. **Review & repeat**
   - Leaves a review for the student. Closes the contract.

### 4.C Admin

1. **User moderation**
   - KYC review queue (manual L3 escalations).
   - User report queue (harassment, off-platform attempts, fake profiles).
   - Bulk actions with reason codes; every action audited.
2. **Dispute handling**
   - Dispute Desk (see §B.4); make decisions via templates that emit valid ledger journals.
3. **Fraud monitoring**
   - Risk Queue: items with risk_score above threshold.
   - Cluster view: same-device / same-NID / same-bKash clusters of accounts.
4. **Manual verification**
   - Edge cases (university not yet whitelisted, ambiguous IDs).
5. **Financial ops**
   - Reconciliation exceptions resolution.
   - Payout console (approve held payouts, batch ops).
   - Refund/correction flows (only via templated journals).
6. **Content / taxonomy**
   - Category and skill management (already exists).
7. **Reports**
   - GMV, take-rate, active users, dispute rate, payout success rate, fraud catch rate.

---

## 5. USE CASE DIAGRAM (Text-based, Comprehensive)

**Actors:**
- **S** = Student (Freelancer)
- **C** = Client (Employer)
- **A** = Admin / Ops
- **P** = Payment System (bKash/Nagad/Card/Bank)
- **R** = Risk/Fraud Engine (system actor)
- **N** = Notification Service (system actor)

**Convention:** `«include»` = always-included, `«extend»` = conditional.

```
┌────────────────────────── UniMarketplace ──────────────────────────┐
│                                                                    │
│  Auth & Identity                                                   │
│   - Sign up (S, C)                                                 │
│   - Sign in / OAuth (S, C, A)                                      │
│   - Reset password (S, C, A)                                       │
│   - Verify email (S, C)              «include» Send email          │
│   - Verify phone OTP (S, C)          «include» Send SMS            │
│   - Manage devices / sessions (S, C, A)                            │
│   - Logout / revoke token (S, C, A)                                │
│                                                                    │
│  Student Verification (KYC ladder)                                 │
│   - Upload student ID (S)            «include» OCR + face match    │
│   - Submit NID for L4 (S)            «include» Liveness check      │
│   - Link bKash / bank for payout (S) «include» Name match check    │
│   - Auto-downgrade after grad+24mo (system → S)                    │
│                                                                    │
│  Client Verification                                               │
│   - Verify business / individual (C) «extend» For high-value posts │
│   - Add payment method (C)                                         │
│                                                                    │
│  Profile                                                           │
│   - Build profile (S)                                              │
│   - Add portfolio item (S)                                         │
│   - Take skill test (S)              «extend» Earn skill badge     │
│   - Update availability (S)                                        │
│                                                                    │
│  Jobs                                                              │
│   - Post job (C)                     «include» Budget validation   │
│   - Edit / pause / close job (C)                                   │
│   - Browse / search jobs (S, C)                                    │
│   - Save job / follow client (S)                                   │
│   - Boost / feature job (C)          «extend» Pay boost fee        │
│                                                                    │
│  Bidding                                                           │
│   - Submit proposal (S)              «include» Anti-spam check (R) │
│   - Withdraw proposal (S)                                          │
│   - Shortlist proposal (C)                                         │
│   - Reject proposal (C)                                            │
│   - Send counter-offer (C, S)                                      │
│   - Accept offer (S)                                               │
│                                                                    │
│  Contracts & Milestones                                            │
│   - Create contract from accepted offer (system)                   │
│   - Define / approve milestones (C, S)                             │
│   - Submit deliverable (S)                                         │
│   - Request revision (C)                                           │
│   - Approve milestone (C)                                          │
│   - Auto-release on timer (system → S)                             │
│                                                                    │
│  Payments / Wallet / Escrow                                        │
│   - Deposit funds (C)                «include» Gateway charge (P)  │
│   - Fund escrow (C)                                                │
│   - Release escrow (C, system)                                     │
│   - Refund escrow (A, system)                                      │
│   - Cancel contract (C, S)                                         │
│   - Request payout (S)               «include» Risk check (R)      │
│   - Process payout (system → P)                                    │
│   - View statement / ledger (S, C)                                 │
│                                                                    │
│  Disputes                                                          │
│   - Open dispute (S, C)                                            │
│   - Submit evidence (S, C)                                         │
│   - Mediate (A)                      «extend» Mediation tools      │
│   - Issue decision (A)               «include» Post journal entry  │
│   - Appeal decision (S, C)           «extend» One-time, new evid.  │
│                                                                    │
│  Communication                                                     │
│   - Pre-bid restricted chat (S, C)   «include» Contact-info filter │
│   - Post-contract chat (S, C)                                      │
│   - Schedule meeting (S, C)                                        │
│   - Join meeting (S, C, A)                                         │
│   - Record meeting (C, S)            «extend» Retain for dispute   │
│                                                                    │
│  Reputation                                                        │
│   - Leave review (S, C)              «include» Verified contract   │
│   - Report fake review (S, C, A)                                   │
│   - Compute TrustScore (system)                                    │
│                                                                    │
│  Notifications                                                     │
│   - Receive in-app / email / SMS (S, C, A) (N)                     │
│   - Manage preferences (S, C, A)                                   │
│                                                                    │
│  Risk & Fraud                                                      │
│   - Detect anomaly (R → S, C, A)                                   │
│   - Step-up authenticate (S, C)                                    │
│   - Freeze account (A, R)                                          │
│   - Unfreeze after review (A)                                      │
│                                                                    │
│  Admin Ops                                                         │
│   - Review KYC queue (A)                                           │
│   - Review fraud queue (A)                                         │
│   - Resolve recon exceptions (A)                                   │
│   - Manage taxonomy (A)                                            │
│   - View reports / analytics (A)                                   │
│   - Manage feature flags (A)                                       │
│   - Audit logs (A)                                                 │
│                                                                    │
│  External / Payment System (P)                                     │
│   - Authorize charge (P)                                           │
│   - Send callback (P → system)                                     │
│   - Process payout (P)                                             │
│   - Provide statement (P → system)                                 │
└────────────────────────────────────────────────────────────────────┘

Actor associations (compact):
S → almost all student-side use cases above
C → almost all client-side use cases above
A → all admin, plus oversight on user, jobs, money
P → deposit, payout, callback, statement
R → anti-spam, risk score, dispute auto-suggest
N → all notification deliveries
```

> If you want a graphical version, the structure above maps 1:1 to a PlantUML `@startuml ... @enduml` use-case diagram — easy to render later.

---

## 6. SYSTEM ARCHITECTURE DIAGRAM (Text-based, Detailed)

```
┌─────────────────────────────── CLIENTS ───────────────────────────────┐
│  Web (Next.js)     Mobile (React Native, Phase 2)     Admin (Next.js) │
└────────┬───────────────────┬────────────────────────────────┬─────────┘
         │ HTTPS             │ HTTPS                          │ HTTPS
         ▼                   ▼                                ▼
┌──────────────────────── EDGE ───────────────────────────────────────┐
│  CDN (Cloudflare/BunnyCDN)                                          │
│  WAF (Cloudflare or ModSecurity)                                    │
│  NGINX (TLS, security headers, rate-limit, sticky for WS)           │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────── API GATEWAY (Django ASGI) ──────────────────┐
│  - JWT auth + token blacklist                                       │
│  - Idempotency-Key middleware                                       │
│  - Request signing for internal callbacks                           │
│  - Routing to apps                                                  │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ├────────► REST (DRF)            ├────────► WebSocket (Channels)
         │                                 │
         ▼                                 ▼
┌─────────────────── DOMAIN APPS / SERVICES ──────────────────────────┐
│ accounts │ kyc │ jobs │ biding │ work_diary │ messaging │ meetings  │
│ payments │ wallet │ ledger │ escrow │ payouts │ disputes │ risk     │
│ reputation │ notifications │ search │ admin_ops │ analytics_events  │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────── DATA LAYER ─────────────────────────────────────┐
│ PostgreSQL (primary + read replicas)                                │
│   schemas: core, ledger, risk, audit                                │
│ Redis (cache, channels, celery broker, OTP, idempotency, rate-lim)  │
│ MinIO/S3 — general media   |   MinIO-KYC — encrypted KYC vault      │
│ Search index (Postgres FTS → OpenSearch later)                      │
│ pgvector (embeddings, in same Postgres)                             │
│ ClickHouse / BigQuery (analytics, via Debezium CDC) — Phase 2       │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────── ASYNC PLANE (Celery) ───────────────────────────┐
│ Workers per queue: email, sms, payments, payouts,                   │
│ reconciliation, risk, notifications, analytics, media               │
│ Beat: nightly recon, hourly payout batch, 15m risk, daily reputation│
│ Outbox dispatcher (DB → broker), DLQ for failures                   │
└────────┬────────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────── EXTERNAL SYSTEMS ───────────────────────────────┐
│ Payments In:  bKash, Nagad, Rocket, SSLCommerz/ShurjoPay/AamarPay   │
│ Payouts Out:  bKash B2C, Nagad B2C, Bank (BEFTN/NPSB)               │
│ SMS:          SSL Wireless / Banglalink / Twilio                    │
│ Email:        SES / Postmark / Mailgun                              │
│ Push (later): FCM / APNs                                            │
│ KYC vendors:  Smile ID / IDfy / in-house OCR + face match           │
│ Meetings:     Jitsi (self-hosted, already in stack)                 │
│ Storage cold: S3 Glacier-like (audit & KYC archival)                │
│ Observability:Sentry + Prometheus + Grafana + Loki + OTel traces    │
└──────────────────────────────────────────────────────────────────────┘
```

**Key data flows:**

```
Deposit (client tops up wallet)
─────────────────────────────────
Client UI → API → payments.init  (Idempotency-Key)
                → ledger: NO entry yet
                → return gateway redirect/token
Client → Gateway (bKash) → completes
Gateway → API: callback (signed)
API → payments.verify (re-check via gateway API)
    → ledger.post(deposit journal)
    → outbox: 'wallet.credited' event
    → notifications

Funding escrow
──────────────
Client → API: contract.fund_escrow
       → wallet sufficiency check
       → ledger.post(escrow_fund journal)
       → contract state: FUNDED
       → notify student

Release
───────
Approve / auto-release
       → ledger.post(escrow_release journal: student_avail += 80%, platform.revenue += 20%)
       → contract milestone state: RELEASED
       → outbox: 'milestone.released'

Payout
──────
Student → API: payout.request (Idempotency-Key)
       → KYC + risk check
       → ledger.post(payout_pending journal: available → payout_in_flight)
       → submit to gateway
Gateway → callback success
       → ledger.post(payout_settled journal: payout_in_flight → gateway_settlement)
       → notify
```

---

## 7. MISSING FEATURES (Critical Thinking)

### 7.1 Identity / KYC beyond `.edu`
- **University registry** (curated, versioned).
- **Student ID OCR + liveness** (L3).
- **NID + bKash/bank name match** (L4).
- **Cohort sanity check** (intake year vs ID issue date vs declared university).
- **Alumni grace period** (24 months post grad), then auto-downgrade with re-verification path.
- **Tiered capability unlocks** (caps tied to tiers, see §B.1).

### 7.2 Anti-fraud mechanisms
- Device fingerprint binding.
- Velocity rules across signup, bid, deposit, payout.
- Multi-account graph detection (NID/phone/device/payout-method overlap).
- Off-platform intent classifier in chat/proposals.
- Step-up auth (re-OTP / re-liveness) on risky actions.
- Honeypot fields and bot traps.
- Internal blocklist of names/phones/NIDs/IBANs after confirmed fraud.

### 7.3 Refund abuse prevention
- **Refund reason codes** + caps: a client whose refund-rate > X% triggers review.
- **Auto-release timers** on review windows so silent clients don't hold escrow.
- **Counter-evidence requirement** for refund requests after delivery.
- **Reputation hit** for clients with frequent disputes lost.
- **Prevent same-day refund + repost**: a client who refunds and then immediately reposts the same job to a different student is flagged.

### 7.4 Dispute automation (future)
- Templated outcomes for common patterns (no-delivery, no-response, partial delivery).
- LLM-assisted summary of evidence for human reviewer (kept human-in-the-loop initially).
- Auto-mediation: propose a split based on milestone progress %, both parties accept = closed without admin.

### 7.5 Skill testing / certification
- Short timed assessments per skill (MCQ + small task).
- Anti-cheat: tab-switch detection, randomized banks, time limits.
- Badges feed into proposal score.
- Partner with universities for endorsed skill certificates (differentiator).

### 7.6 AI-assisted proposal improvement
- Quality coach for students: "Your proposal is 90% generic, try addressing X from the JD."
- Optional, free to use; nudges quality up; reduces spam.
- Don't autogenerate proposals (kills authenticity + ranking signals).

### 7.7 Client budget validation
- Budget benchmarking per category.
- Floor warnings ("Below 90% of similar"), absolute floors below which posting is blocked unless boosted.
- Suggested milestone breakdowns.
- Client trust score affects how aggressively students bid; show client's "hire rate" and "avg payment time."

### 7.8 Student reliability scoring
- On-time delivery rate.
- Response time median.
- Cancellation rate.
- Dispute loss rate.
- Reliability score weighted into matching, separate from rating (a 5★ unreliable student is worse than a 4.5★ very reliable one).

### 7.9 Other often-missed features
- **In-app NDA template** sign + record.
- **Watermarked deliverable previews** to deter premature copy.
- **Versioned deliverables** with diff/preview.
- **Time tracker** (hourly contracts) with screenshots/activity (opt-in, privacy-respecting).
- **Tax statements** (annual earnings summary) for students.
- **Group/agency mode** (Phase 3) — student teams.
- **Referral program with anti-abuse** (referrer reward only after referee completes paid contract).
- **Public profile SEO** (helps students get found).
- **2FA (TOTP)** for admins and high-value accounts.
- **Webhooks** for clients (enterprise tier) — get events about jobs/contracts.
- **Bangla-first UI** option, voice input on mobile.

---

## 8. EDGE CASES (Real-World)

| # | Edge case | What happens | Designed response |
|---|---|---|---|
| 1 | Client disappears after submission | No approve, no dispute | **Auto-release** after N days (configurable, e.g. 7); notify client multiple times before; if dispute opened in window, suspend timer |
| 2 | Student submits low-quality work repeatedly | Multiple rejected milestones | Reliability score drops; auto-warning; threshold → temporary suspension; full ban after appeal exhausted |
| 3 | Payment gateway outage mid-deposit | Pending forever | Polling job + reconciliation; user sees "pending" with ETA; on confirmed fail → release UI; retry path |
| 4 | Dispute abuse by client | Files dispute on every contract | Track dispute-open vs dispute-won; pattern triggers review; pre-funding required for repeat clients; cap on simultaneous disputes |
| 5 | Dispute abuse by student | Always claims more work | Same — track win/loss, downrank, eventual ban |
| 6 | Multi-account fraud | One person, many accounts | Device + NID + phone + payout-method graph; single confirmed link → ban entire cluster; appeal possible |
| 7 | Chargeback after escrow release | Money already paid out | **Hold cooling period** (e.g., 7 days) before payout for new clients/cards; insurance fund/loss reserve from commission |
| 8 | Off-platform deal | Student gets paid via bKash directly | Pre-bid filter; warn signals; reputation penalty; if confirmed → ban |
| 9 | University not in registry | Legitimate student blocked | Manual verification queue with 48h SLA; admin can whitelist new domain |
| 10 | Student graduates mid-contract | Account about to downgrade | Allow active contracts to finish; new contracts blocked at L2/L3 |
| 11 | Account compromise | Attacker logs in, withdraws | Step-up auth on payout; cooling-off after password change (24h no payout); device anomaly → freeze |
| 12 | Currency rounding | Sub-paisa amounts | Round at posting time; deltas → `rounding` account |
| 13 | Same student bidding on related-client jobs | Conflict of interest | Disclosure flag; high-risk pattern reviewed |
| 14 | Plagiarized portfolio | Student copies others' work | Reverse image search + community reporting; remove + reputation hit |
| 15 | Job content abuse | Illegal/unethical job posts | Content moderation (rules + classifier); admin queue; ban client |
| 16 | NID/Student-ID image leak | Storage breach | KYC vault with separate keys, short-lived URLs, access logged, no PII in logs |
| 17 | Auto-release on a Friday holiday | Time-based timers | Use absolute UTC + clear policy; or skip non-business days for sensitive timers |
| 18 | Race: client cancel vs student deliver | Both at same instant | DB row-level lock on contract + state machine guard; first-to-commit wins, the other returns 409 with explanation |
| 19 | Webhook replay | Same callback delivered 3× | Idempotency key on `gateway_txn_id`; ignore duplicates |
| 20 | Partial gateway success (deducted from user but not us) | Customer complaint | Reconciliation will catch; in the meantime support ticket flow with guaranteed credit if proven |

---

## 9. SCALABILITY PLAN

### 9.1 Stage 1 — 0 to 1,000 active users
- Single Postgres, single Redis, MinIO, single Django ASGI behind Nginx.
- All Celery queues on one worker.
- Manual KYC review acceptable.
- Monolithic Django apps (current shape).
- **Focus:** correctness of ledger + dispute workflow + KYC funnel.

### 9.2 Stage 2 — 1,000 to 100,000 users
- **Postgres**: enable streaming replication; route reads to replicas (lists, search). PgBouncer.
- **Indexes**: heavy review of slow queries; partial indexes on hot tables (active jobs, in-flight contracts).
- **Partitioning**: `journal_entries`, `postings`, `audit_log` by month.
- **Cache**: Redis for job feed, profile reads, leaderboards.
- **Search**: move full-text from Postgres FTS to **OpenSearch / Meilisearch** when query latency becomes an issue.
- **Celery**: split workers per queue, autoscale. Add DLQ.
- **Outbox dispatcher** becomes essential.
- **Observability**: Sentry, Prometheus, Grafana, Loki, OpenTelemetry traces — non-negotiable.
- **CDN** for static assets and signed media URLs.
- **Feature flags** (Unleash / Flagsmith) for safe rollouts.
- **Read-heavy endpoints**: paginate aggressively (cursor pagination), no `OFFSET` on large lists.
- **Rate limits** per IP/user/endpoint via Redis token buckets.
- **First-step service split**: extract **ledger/payments** and **risk** into their own services with internal RPC (gRPC or REST + auth) — they have the strictest SLAs and different deploy cadence.

### 9.3 Stage 3 — 100,000 to 1,000,000 users
- **Microservices**, but only where boundaries are real:
  - `identity-svc` (auth, KYC, devices)
  - `ledger-svc` (single writer for postings, strict)
  - `payments-svc` (gateway adapters, payouts)
  - `marketplace-svc` (jobs, bids, contracts)
  - `messaging-svc` (chat + notifications fan-out)
  - `risk-svc`
  - `search-svc`
  - `analytics-svc`
- **Event backbone**: Kafka or Redpanda. Outbox publishes events → consumers project read models.
- **CQRS** for heavy read views: e.g., `client_dashboard_view`, `student_dashboard_view`, materialized via consumers.
- **Sharding**: Postgres logical sharding per region (BD-only initially → not urgent), or Citus for ledger if write volume demands.
- **Data warehouse**: ClickHouse/BigQuery for analytics; DBT-managed transforms.
- **Real-time** (chat, notifications): dedicated Channels cluster; consider moving to a specialized realtime service (e.g., Centrifugo or in-house Go service) if Python WS becomes a bottleneck.
- **K8s** for orchestration (HPA on CPU + queue depth).
- **Multi-AZ** Postgres (managed: AWS RDS multi-AZ / GCP Cloud SQL).
- **Backups + DR**: PITR, weekly restore drills.
- **Compliance** maturity: full audit, SOC2-style controls, BB licensing path if doing in-house payments.
- **ML**: real fraud models, recommendation, search relevance.

### 9.4 Caching strategy summary

| Data | Cache | TTL | Invalidation |
|---|---|---|---|
| Public job listing pages | Redis (per filter) | 30s–5m | On job publish/edit + TTL |
| Profile reads | Redis | 5m | On profile update |
| Categories/skills | Redis | 1h | On admin change |
| Auth user object | Redis | 5m | On user update / logout |
| TrustScore | Redis | 1h | Recomputed nightly + on event |
| Idempotency keys | Redis | 24h | TTL only |
| OTP | Redis | 5m | TTL + use |
| Rate limits | Redis (token bucket) | rolling | TTL |

Never cache: ledger balances at the request layer (always read live or via short-lived materialization on the DB side).

### 9.5 Queue strategy summary

| Queue | Purpose | Concurrency | Retry | DLQ |
|---|---|---|---|---|
| email | Transactional + marketing | high | exp backoff | yes |
| sms | OTP + alerts | high | quick retry, fail-fast | yes |
| payments | gateway calls | medium | careful, idempotent | yes |
| payouts | outbound to MFS/bank | low, serialized per user | conservative | yes |
| reconciliation | nightly | low | manual on fail | yes |
| risk | event scoring | high | fast | yes |
| notifications | fan-out | high | exp backoff | yes |
| analytics | events to warehouse | high | bulk | yes |
| media | thumbnails, virus scan | medium | retry | yes |

---

## 10. MONETIZATION EXPANSION

Don't depend on the 20% commission alone — it's vulnerable to off-platform leakage and is regressive on small jobs.

### 10.1 Take-rate (commission) refinements
- **Tiered commission** on the same student-client pair lifetime spend:
  - First BDT 50,000: 20%
  - 50K–500K: 12%
  - 500K+: 8%
  - Reduces incentive to leave the platform once a relationship matures.
- **Verified Trusted (L5) discount**: −2% take-rate.
- **Boost discount**: if client uses paid boost, fee drops slightly (cross-sell).

### 10.2 Boosted proposals (student-paid)
- A student can boost a proposal to be ranked above non-boosted with same score.
- Pay-per-boost (BDT 30–100), capped per job, clearly labeled "Boosted".
- Anti-pay-to-spam: only L3+ users can boost; boost can't override hard demerits.

### 10.3 Featured listings (client-paid)
- Promote a job to top of the relevant category.
- Highlight badge.
- Optional "urgent" tag with surcharge.

### 10.4 Subscriptions

**Student tiers:**
- **Free**: 8 active proposals, standard ranking, basic profile.
- **Pro (BDT 199/mo)**: 25 active proposals, profile insights, advanced filters, skill test attempts, profile boosts (limited), priority email support.
- **Elite (BDT 499/mo)**: 50 active proposals, "Featured Student" placement in category pages, lower withdrawal fees, dedicated badge.

**Client tiers:**
- **Free**: Standard posting, standard support.
- **Business (BDT 999/mo)**: Unlimited posts, applicant tracking, multiple seats (up to 3), webhooks, faster support.
- **Agency (BDT 2,499/mo)**: Up to 10 seats, advanced analytics, API access, dedicated CSM, lower take-rate.

### 10.5 Other revenue streams
- **University partnership packages**: paid placements for university career centers; sponsored "career fair" pages.
- **Skill certification fees**: small fee per certification attempt (after free attempt).
- **Payout speed-up fee**: instant payout vs T+1 free.
- **FX margin** (when foreign clients land later).
- **Insurance/escrow plus** add-on: client buys "completion guarantee" for high-value jobs.
- **Anonymous talent pool API** (Phase 3): companies pay to query the verified talent pool.
- **Recruitment tier**: full-time placement fee when companies hire students full-time off the platform (declared, with one-time placement fee — keeps it on the books and legal).

### 10.6 Promo & growth credits
- **Promo credits** are platform-issued, redeemable against fees only (never withdrawable). Modeled as a separate liability account (`platform.promo_payable`) to keep them off real cash balances.
- Referral program rewards in promo credits, not cash, until anti-abuse signals clear.

---

## Appendix A — Suggested DB Schema Additions (DDL sketches)

Concise sketches; keep alongside the existing apps.

```sql
-- university registry
CREATE TABLE university_registry (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country CHAR(2) DEFAULT 'BD',
  email_domains TEXT[] NOT NULL,
  status TEXT CHECK (status IN ('active','pending','blocked')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- KYC records (PII; encrypted columns)
CREATE TABLE kyc_records (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES auth_user(id),
  tier SMALLINT NOT NULL,
  status TEXT CHECK (status IN ('submitted','approved','rejected','expired')),
  university_id BIGINT NULL REFERENCES university_registry(id),
  student_id_no_enc BYTEA NULL,
  nid_no_enc BYTEA NULL,
  doc_front_key TEXT NULL,
  doc_back_key TEXT NULL,
  selfie_key TEXT NULL,
  ocr_extracted JSONB NULL,
  liveness_score NUMERIC(5,4) NULL,
  reviewer_id BIGINT NULL,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ledger schema (see §3.2)
CREATE SCHEMA IF NOT EXISTS ledger;
-- (accounts, journal_entries, postings, balances_cache as in §3.2)

-- escrow
CREATE TABLE escrow_holds (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT NOT NULL,
  milestone_id BIGINT NULL,
  account_id BIGINT NOT NULL REFERENCES ledger.accounts(id),
  state TEXT NOT NULL,
  funded_at TIMESTAMPTZ NULL,
  released_at TIMESTAMPTZ NULL,
  refunded_at TIMESTAMPTZ NULL
);

-- idempotency
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  request_hash TEXT NOT NULL,
  response_status INT NULL,
  response_body JSONB NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- outbox
CREATE TABLE outbox_events (
  id BIGSERIAL PRIMARY KEY,
  aggregate TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending','dispatched','failed')) DEFAULT 'pending',
  attempts INT DEFAULT 0,
  next_attempt_at TIMESTAMPTZ DEFAULT now(),
  dispatched_at TIMESTAMPTZ NULL
);

-- audit log (hash-chained)
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  prev_hash TEXT NOT NULL,
  hash TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id BIGINT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NULL,
  diff JSONB NULL,
  ip INET NULL,
  device_id TEXT NULL,
  request_id TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Appendix B — Sequence: Funding → Delivery → Release → Payout

```
Client          API/App        Ledger        Gateway         Student
  │                │              │              │              │
  │ deposit init   │              │              │              │
  ├───────────────►│  idempotency │              │              │
  │                ├─────────────►│ no entry yet │              │
  │                │              │              │              │
  │                │  redirect    │              │              │
  │◄───────────────┤              │              │              │
  │  pay on bKash  │              │              │              │
  ├──────────────────────────────────────────────►│              │
  │                │  callback signed             │              │
  │                │◄─────────────────────────────┤              │
  │                │   verify w/ gateway          │              │
  │                ├─────────────────────────────►│              │
  │                │   ok                         │              │
  │                │◄─────────────────────────────┤              │
  │                │  post deposit journal        │              │
  │                ├─────────────►│              │              │
  │                │              │              │              │
  │ fund escrow    │              │              │              │
  ├───────────────►│  ledger.escrow_fund          │              │
  │                ├─────────────►│              │              │
  │                │              │              │              │  notify
  │                ├──────────────────────────────────────────►│
  │                │                                            │
  │                │◄───────────────────── deliverable ─────────┤
  │ approve        │                                            │
  ├───────────────►│  ledger.escrow_release (80/20)             │
  │                ├─────────────►│                             │
  │                │  notify                                    │
  │                ├──────────────────────────────────────────►│
  │                │                                            │
  │                │◄───────────────────── payout request ──────┤
  │                │  risk + KYC check                          │
  │                │  ledger.payout_pending                     │
  │                ├─────────────►│                             │
  │                │   submit payout                            │
  │                ├──────────────────────────►│ bKash B2C       │
  │                │   callback success                          │
  │                │◄──────────────────────────┤                 │
  │                │  ledger.payout_settled                      │
  │                ├─────────────►│                             │
  │                │  notify                                    │
  │                ├──────────────────────────────────────────►│
```

---

## Appendix C — What's already in your repo vs what to build next

**Already there (great foundation):**
- Auth, JWT, Google OAuth, email verification.
- Jobs/bids/contracts/milestones/work diary.
- Chat (Channels) + notifications (WS) + meetings (Jitsi).
- Admin app + admin-api ViewSets.
- Compose stack (Postgres, Redis, MinIO, Nginx, Mailcatcher).

**Build-next priority queue (12-week plan, indicative):**

1. **W1–W2:** University registry + tiered KYC ladder + device fingerprint.
2. **W2–W4:** Ledger (accounts/entries/postings) + idempotency + outbox; rebuild `payments` on top.
3. **W4–W6:** Escrow lifecycle + auto-release timers + reconciliation job.
4. **W6–W7:** Disputes module + admin Dispute Desk.
5. **W7–W8:** Reputation engine + TrustScore + proposal ranking.
6. **W8–W9:** Risk rules engine + fraud queue.
7. **W9–W10:** Withdrawal flow + payout console + NID/bank match.
8. **W10–W11:** Anti off-platform chat filter + proposal anti-spam quotas.
9. **W11–W12:** Observability (Sentry, Prom/Grafana, structured logs) + load tests + DR drills.

After W12 you have a defensible v1 fintech-grade BD student marketplace.

---

## Closing Note

UniMarketplace's moat is not "another freelance site." It is:
1. **Verified-only entry-level talent** — clients trust who they're hiring.
2. **Real fintech rails** (ledger + escrow + reconciliation) — students trust they'll get paid.
3. **Reliability scoring** — quality compounds.

Build the ledger first, the trust score second, and everything else third. Skip those two and you'll ship features but never a business.
