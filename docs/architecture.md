# Architecture and invariants

[Visual guide](index.html) · [API contract](api-contract.md) · [Gap register](gaps.md)

## System boundary

```mermaid
flowchart LR
  C[Customer UI] --> API
  W[Worker UI] --> API
  A[Federation UI] --> API
  API[Spring Boot REST API
JWT + validation + ownership] --> AUTH[Authentication]
  API --> JOB[Job lifecycle and dispatch]
  API --> BILL[Payment simulation and welfare]
  API --> ADM[Verification and administration]
  JOB --> DB[(PostgreSQL + PostGIS)]
  AUTH --> DB
  BILL --> DB
  ADM --> DB
  T[Persistent dispatch scheduler
every 5 seconds] --> JOB
  API --> F[Forecast HTTP adapter]
  F -. configured separately .-> ML[External model service]
  SMS[SMS delivery adapter: outstanding] -.-> AUTH
  PAY[Payment provider: outstanding] -.-> BILL
```

A modular monolith keeps assignment, payments, welfare and audit records in single database transactions. Spring JDBC makes row locks and spatial predicates explicit. There is no Redis, message broker, microservice deployment or hidden in-memory job queue.

## Data relationships

```mermaid
erDiagram
  FEDERATION ||--o{ SOCIETY : contains
  SOCIETY ||--o{ WORKER : registers
  APP_USER ||--o| WORKER : profile
  APP_USER ||--o{ AUTH_SESSION : authenticates
  WORKER ||--o{ WORKER_SKILL : declares
  CATEGORY ||--o{ WORKER_SKILL : qualifies
  CATEGORY ||--o{ SUBSERVICE : groups
  SUBSERVICE ||--o{ QUOTE : prices
  APP_USER ||--o{ QUOTE : requests
  QUOTE ||--o| JOB : consumed_once
  WORKER o|--o{ JOB : assigned
  JOB ||--o{ JOB_OFFER : offers
  WORKER ||--o{ JOB_OFFER : receives
  JOB ||--o{ JOB_HISTORY : transitions
  JOB ||--o{ MANUAL_DISPATCH : intervention
  JOB ||--o| PAYMENT : settles_once
  PAYMENT ||--o| WELFARE_ENTRY : contributes
  JOB ||--o| INVOICE : receipt
  JOB ||--o| RATING : rates_once
```

Notifications and administrator audit events are durable rows. UAN is encrypted using AES-GCM, with a keyed fingerprint for deduplication and a last-four representation for display. Full UAN never appears in response DTOs. GPS stores the latest point and timestamp, not a movement trail.

## Job state machine

```mermaid
stateDiagram-v2
  [*] --> SEARCHING: valid quote + idempotency key
  SEARCHING --> OFFERED: standard/on-demand best candidate
  SEARCHING --> BROADCAST: emergency eligible pool
  SEARCHING --> EXPIRED: no candidate
  OFFERED --> SEARCHING: decline or timeout, try next
  OFFERED --> ACCEPTED: eligible worker accepts
  BROADCAST --> ACCEPTED: first eligible accept
  BROADCAST --> EXPIRED: all decline or window expires
  EXPIRED --> SEARCHING: customer/admin retry, maximum 3
  EXPIRED --> ACCEPTED: audited manual dispatch
  ACCEPTED --> TRAVELLING: assigned worker
  TRAVELLING --> ARRIVED: assigned worker
  ARRIVED --> IN_PROGRESS: correct doorstep OTP
  IN_PROGRESS --> COMPLETED: assigned worker
  SEARCHING --> CANCELLED
  OFFERED --> CANCELLED
  BROADCAST --> CANCELLED
  ACCEPTED --> CANCELLED
  TRAVELLING --> CANCELLED
  ARRIVED --> CANCELLED
  EXPIRED --> CANCELLED
  COMPLETED --> [*]
  CANCELLED --> [*]
```

Customer or admin can cancel before work starts. Cancellation after `IN_PROGRESS`, worker cancellation, disputes and refunds require additional policy and implementation. A scheduled job stays `SEARCHING` until 15 minutes before its scheduled time; it does not reserve a worker or guarantee capacity.

## Matching and atomic acceptance

```mermaid
flowchart TD
  J[Dispatch due] --> G{Verified required skill
ACTIVE and available
GPS under 15 minutes old
inside radius
no active assigned job}
  G -->|No candidates| E[EXPIRED + admin event]
  G -->|STANDARD / ON_DEMAND| S[Compute deterministic score]
  S --> O[Offer highest score for 60 seconds]
  O -->|Decline / timeout| N[Exclude attempted workers, dispatch again]
  N --> G
  G -->|EMERGENCY| B[Broadcast to every eligible worker
60–90 second configured window]
  O --> L[Lock job row, then worker row]
  B --> L
  L --> V[Recheck offer deadline and eligibility]
  V --> A[Assign one worker; close competing offers]
```

| Signal | Definition |
|---|---|
| Proximity | `max(0, 1 - distanceMeters / dispatchRadiusMeters)` |
| Rating | `(averageRating - 1) / 4`; initial average is 3 |
| Load | `0.5 × min(todayCompleted/8,1) + 0.3 × min(last7DaysCompleted/40,1) + 0.2 × (1-min(idleHours/24,1))` |
| Final score | `0.5 × proximity + 0.3 × rating - 0.2 × load` with configurable weights |
| Tie | Worker UUID ascending, deterministic |
| Emergency | No score; broadcast breakdown records distance and mode |

Busy workers are excluded before scoring. Daily counts follow the database timezone (default UTC); the normalization constants are provisional product choices. Weights and a policy version are recorded in offer breakdowns. Pricing is snapshotted at quote creation; scoring weights are read at dispatch time. Default radii: 10 km standard/on-demand, 5 km emergency. PostGIS geography predicates measure meters and use spatial indices.

```mermaid
sequenceDiagram
  participant C as Customer
  participant API as API
  participant DB as PostgreSQL
  participant W as Worker
  C->>API: Create job + Idempotency-Key
  API->>DB: Transaction + customer/key advisory lock
  API->>DB: Lock quote; validate owner, expiry and one-time use
  API->>DB: Insert job, offers, history and events
  DB-->>C: Committed job view
  W->>API: Accept offer
  API->>DB: Lock job then worker; recheck eligibility
  API->>DB: Assign worker; mark other offers TAKEN
  DB-->>W: Assigned job
  Note over API,DB: Partial unique index forbids two active jobs per worker
```

Identical booking retries return the existing current job view; reusing the key with a different payload returns 409. This is not blanket idempotency for every mutation. A quote can create at most one job. `FOR UPDATE SKIP LOCKED` lets dispatch schedulers share due jobs without duplicating work. Each tick handles at most 30 jobs, so deadline processing can lag under load; acceptance itself rejects expired offers.

## Doorstep authorization

```mermaid
sequenceDiagram
  participant W as Assigned worker
  participant API as Backend
  participant C as Owning customer
  W->>API: POST arrive
  API->>API: Create encrypted six-digit OTP, 10-minute expiry
  C->>API: GET doorstep-code
  API-->>C: OTP + expiry + attempts remaining
  C-->>W: Share code at doorstep
  W->>API: POST start {otp}
  API->>API: Lock job; validate expiry and attempts
  API-->>W: IN_PROGRESS, clear OTP
```

Five wrong attempts lock use until expiry and customer renewal. OTP access is customer-only, including when an administrator views the job. OTP demonstrates customer authorization; it does not prove physical co-location.

## Financial transaction

```mermaid
flowchart LR
  C[COMPLETED job] --> P[Customer simulation request]
  P --> L[Lock job]
  L --> E{Payment already exists?}
  E -->|Yes| R[Return existing payment]
  E -->|No| T[One transaction]
  T --> PAY[Payment row]
  T --> W[Welfare ledger row]
  T --> I[Immutable receipt snapshot]
```

`surplus = gross - base`; `welfare = round(surplus × welfareRate, 2)`; `workerEarning = gross - welfare`; `platformFee = 0`. With a nonnegative surcharge and welfare rate in [0,1], worker earnings never fall below base. Monetary values use decimal arithmetic and HALF_UP rounding. Fixed pricing means gross=base and welfare=0. The simulated receipt is explicitly `DEMONSTRATION_RECEIPT`, `SIMULATED_SUCCEEDED`, `NOT_ASSESSED` for tax; it is not evidence of payment or a compliant tax invoice.
