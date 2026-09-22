Product Blueprint

---

## What we are building

We are building a cooperative-owned services marketplace that connects customers with verified cooperative workers.

We are keeping the product to **three interfaces**:

- **Customer** — discover services, book, pay and rate.
- **Worker** — register, get verified, manage availability and accept jobs.
- **Federation Admin** — manage the cooperative workforce, monitor allocation/welfare and use demand forecasts.

A society is **not a separate application**. It is the organizational relationship between a worker and the federation.

```text
                         COOPGIG
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          CUSTOMER        WORKER       FEDERATION
             │              │              │
             └──────────────┼──────────────┘
                            │
                     Spring Boot API
                            │
                  PostgreSQL + PostGIS
                            │
                     Existing ML Model
```

---

## Core job flow

I want the whole prototype to revolve around one complete job lifecycle instead of a bunch of disconnected features.

```text
WORKER
Register → Society + membership + skills → Verification → Available

CUSTOMER
Select service → Location + date/time → Book

                         ↓
                 MATCHING ENGINE
                         ↓
       Skill + Verification + Availability
              + Distance + Fairness
                         ↓
                  Worker selected
                         ↓
                   Worker accepts
                         ↓
       Travelling → Arrived → In Progress
                         ↓
                      Completed
                         ↓
               Payment + Wage Floor
                         ↓
                  Welfare Contribution
                         ↓
                    Invoice + Rating
                         ↓
                 Federation Dashboard
                         ↓
                  Demand Forecasting
                         ↓
                  Workforce Planning
```

---

## Customer experience

- Customer starts on the service marketplace.
- Main categories are Plumbing, Electrical, Carpenter, Painting, Domestic Help, Caregiving, Driving, Gardening, Cleaning and Technician Services.
- Customer selects a category and specific service.
- Customer enters the service location and chooses immediate or scheduled booking.
- Customer confirms the booking.
- The platform finds the worker; the customer does not manually pick one.
- Customer sees the assigned worker, service, time, status and payment details.
- Job status moves through Searching → Worker Assigned → Accepted → Travelling → Arrived → In Progress → Completed.
- After completion, customer pays, receives the invoice and submits a rating.

```text
Plumbing
   ↓
Pipe Leakage Repair
   ↓
Location
   ↓
Today · 4:00 PM
   ↓
Confirm Booking
```

---

## Worker experience

- Worker registers with name, phone, society, membership ID, skills and certifications.
- Worker selects their registered society so the cooperative relationship is stored properly.
- Worker starts as `PENDING_VERIFICATION`.
- Verification checks the society relationship, membership and required skills.
- Once verified, worker becomes `ACTIVE`.
- Only active workers with the required verified skill can receive matching offers.
- Worker can manage availability and view incoming jobs, active jobs, completed jobs, earnings, welfare contribution and insurance status.
- A job offer shows the service, approximate distance, scheduled time and estimated earning.
- Worker accepts or declines the offer.
- If an offer is declined or expires, matching can run again with that worker excluded.

```text
Register
   ↓
Society + Membership
   ↓
Skills + Certification
   ↓
Verification
   ↓
ACTIVE
   ↓
Available for Jobs
```

---

## Service catalog

| Category | Example services |
|---|---|
| Plumbing | Pipe leakage, tap repair, drain blockage, bathroom plumbing |
| Electrical | Fan repair, switch/socket repair, wiring, light installation |
| Carpenter | Furniture assembly, drilling, furniture/door/chair repair |
| Painting | Wall painting, room painting, touch-up, doors/windows |
| Domestic Help | Housekeeping, cooking assistance, laundry, household help |
| Caregiving | Elderly care, patient assistance, child care, home support |
| Driving | Local driver, outstation driver, pickup/drop, on-demand |
| Gardening | Garden maintenance, trimming, lawn, planting, terrace garden |
| Cleaning | Home, deep, bathroom, kitchen, post-event cleaning |
| Technician | Laptop, CCTV, printer, Wi-Fi/network, desktop, appliance service |

---

## Matching and location

```text
Customer Job
     │
     ▼
Required Service / Skill
     │
     ▼
Verified Workers
     │
     ▼
Available Workers
     │
     ▼
PostGIS Radius Search
     │
     ▼
Fair Allocation Check
     │
     ▼
Selected Worker
```

- Required verified skill is checked first.
- Unavailable and unverified workers are removed.
- PostGIS finds suitable workers within the configured service radius.
- Current workload, previous allocation and distance are considered.
- Rating can support the decision but cannot become the sole allocation mechanism.
- The backend stores the allocation reason so the federation can inspect it.

---

## Fair allocation — deterministic scoring heuristic

Allocation for a standard (non-emergency) job uses a single deterministic score computed over the eligible worker pool. No ML, no black box — a fixed weighted formula so every decision is explainable to the federation.

**Eligible pool first (hard filters, in order):**

```text
1. Has required skill (verified)
2. Status = ACTIVE / VERIFIED
3. Status = AVAILABLE
4. Within configured service radius (PostGIS)
```

Any worker failing a hard filter is excluded before scoring — these are not weighted, they're gates.

**Score the remaining pool:**

```text
Score = (W1 × ProximityScore)
      + (W2 × RatingScore)
      - (W3 × DailyLoadPenalty)
```

| Factor | Direction | Definition |
|---|---|---|
| ProximityScore | higher is better | Normalized inverse of distance within radius (closer = higher score) |
| RatingScore | higher is better | Worker's rolling average customer rating, normalized 0–1 |
| DailyLoadPenalty | higher is worse | Increases with number of jobs already completed/active today, to prevent overload and spread work across the pool |

Default weighting for prototype: **W1 = 0.5, W2 = 0.3, W3 = 0.2** — proximity dominates (customers feel wait time most), rating matters but can't be the deciding factor alone, and load penalty exists specifically so one high-rated nearby worker doesn't absorb every job in a zone.

- Highest score wins the offer.
- The winning worker's raw score and each component's contribution are stored against the job, so the federation dashboard can show *why* that worker was picked.
- Weights (W1/W2/W3) are config, not hardcoded — federation can retune them without a redeploy.

```text
ELIGIBLE WORKERS (post hard-filter)
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
Proximity Rating DailyLoad
 └─────┼─────┘
       ▼
  Weighted Score
       ▼
  Highest Score Wins
       ▼
  Worker Selected + Reason Logged
```

---

## Emergency jobs

Emergency/on-demand bookings (e.g. burst pipe, electrical fault, urgent medical assist for caregiving) use a **different dispatch model** from the standard scored allocation above — urgency needs speed over fairness rotation.

**1. Broadcast + First-Come, First-Served lock**
- The job is broadcast concurrently (push notification / in-app alert) to all `AVAILABLE` workers with the required skill inside the radius — not offered to one worker at a time.
- Backend enforces an **atomic state lock** on the job: the first worker to tap "Accept" wins it. That write must be atomic (e.g. conditional update / row lock) so two simultaneous accepts can't both succeed.
- On lock, the job is immediately cleared from every other worker's screen.

**2. Strict timeout & fallback**
- Hard timeout: **60–90 seconds** from broadcast.
- If no worker accepts within the window, the customer's UI updates directly: `No emergency workers nearby` — the job does not sit in limbo.
- Customer is given the option to retry broadcast, widen radius, or fall back to a standard (non-emergency) booking.

**3. Manual dispatch fallback (Federation Admin)**
- If the broadcast times out unfulfilled, the job is flagged on the Federation Admin Dashboard as an **unfulfilled emergency**.
- A human admin can manually phone/contact an available worker or otherwise intervene outside the app flow.
- This manual intervention is logged against the job (who dispatched, how, when) so the record stays complete even when the automated path failed.

```text
EMERGENCY JOB CREATED
        │
        ▼
Broadcast to all AVAILABLE + skilled workers in radius
        │
        ▼
   First "Accept" wins (atomic lock)
        │
   ┌────┴────┐
   ▼         ▼
 Accepted   Timeout (60–90s)
   │         │
   │         ▼
   │   Customer UI: "No emergency workers nearby"
   │         │
   │         ▼
   │   Flagged on Federation Dashboard
   │         │
   │         ▼
   │   Manual admin dispatch / phone call
   │         │
   └────┬────┘
        ▼
   Job proceeds (Travelling → ... → Completed)
```

- Emergency jobs does not carry a additional fee.

---

## Job lifecycle

```text
SEARCHING → OFFERED → ACCEPTED → TRAVELLING
                                      ↓
                                  ARRIVED
                                      ↓
                                IN_PROGRESS
                                      ↓
                                  COMPLETED
```

- Supporting states: `CANCELLED`, `EXPIRED`, `DISPUTED`.
- Emergency jobs use `BROADCAST` in place of `OFFERED` (concurrent multi-worker offer instead of single sequential offer), with the same downstream states from `ACCEPTED` onward.
- Backend controls valid state transitions.
- If a worker declines or an offer expires, that worker is removed from the current attempt.
- A simple OTP can be used at arrival/start if required.
- No continuous live GPS tracking is needed.

---

## Payment, wage floor and invoice

```text
                  COMPLETED JOB
                       │
                       ▼
                Payment Calculation
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 Customer Price   Worker Earning   Welfare
                       │
                       ▼
                 Wage Floor Check
                       │
                       ▼
                    Invoice
```

- Federation fixes the **base price** for each service. This base price is also the worker's **wage floor** for that service — the worker is guaranteed at least the base price regardless of what the customer is charged.
- Any amount the customer pays **above** the base price is the surplus. Welfare contribution is deducted from the surplus, and the remainder of the surplus goes to the worker on top of the base price.

**Worked example:**

```text
Customer pays:          1200
Federation base price:  1000   → guaranteed worker floor
Surplus:                 200   (1200 − 1000)
Welfare contribution:    100   (deducted from surplus)
Worker take-home:       1100   (1000 base + 100 remaining surplus)
```

```text
Formula:

Surplus              = CustomerPrice − BasePrice
WelfareContribution  = f(Surplus)          // federation-configured rule/rate
WorkerEarning        = BasePrice + (Surplus − WelfareContribution)

Constraint (always holds):
WorkerEarning >= BasePrice
```

- The wage floor is therefore structural, not a post-hoc check: welfare is only ever taken out of the surplus, never out of the guaranteed base price. There is no scenario in this formula where the worker earns below the base price.
- If `CustomerPrice == BasePrice` (no surplus), welfare contribution is 0 and the worker earns exactly the base price.
- Emergency job surcharges add to `CustomerPrice`, which increases the surplus pool — the worker's floor stays the base price, but the premium flows through the same surplus → welfare/worker split.
- Prototype payment can be simulated or connected to a sandbox provider.
- Invoice records the job, service, customer, worker, total amount, base price, surplus, welfare contribution, worker earning and applicable charges.

---

## Welfare and insurance

```text
JOB COMPLETED
      ↓
Welfare contribution calculated (from surplus, see wage floor formula)
      ↓
Worker welfare ledger updated
      ↓
Insurance status / eligibility updated
```

- Worker can view welfare contribution history.
- Federation can view aggregate welfare information.
- Insurance is represented through a prototype enrollment/status record.
- The prototype does not claim to issue real insurance policies.

---

## Rating and feedback

```text
COMPLETED JOB
     ↓
1–5 ★ Rating + Optional Feedback
     ↓
Stored against Job + Worker
```

- Customer rates the completed service.
- Rating is stored against the job and worker.
- Rating feeds `RatingScore` in the deterministic allocation formula above — it supports matching but, by weighting (W2 = 0.3 of three factors), cannot become the sole allocation mechanism.

---

## Federation Admin

The federation dashboard gives one operational view of the cooperative workforce.

```text
┌─────────────────────────────────────────────────────────┐
│                  FEDERATION DASHBOARD                   │
├──────────────┬──────────────┬──────────────┬───────────┤
│ Active       │ Jobs Today   │ Available    │ Welfare   │
│ Workers      │              │ Workers      │           │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│ Job Distribution        Workforce                      │
│ Plumbing     ████       Available                      │
│ Electrical   ███        Working                        │
│ Cleaning     █████      Unavailable                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Demand Forecast          Allocation                     │
│ Plumbing      HIGH       Capacity gaps / recommendations│
│ Cleaning      HIGH                                      │
│ Gardening     LOW                                       │
├─────────────────────────────────────────────────────────┤
│ Unfulfilled Emergencies (flagged for manual dispatch)   │
└─────────────────────────────────────────────────────────┘
```

- Federation can inspect societies, workers, skills and verification.
- Federation can see availability, current workload and job distribution.
- Federation can inspect allocation decisions (score + component breakdown) and welfare/insurance information.
- Federation can see and manually resolve unfulfilled emergency jobs.
- Federation configures base price per service (= wage floor), welfare rate/rule, allocation weights (W1/W2/W3) and emergency surcharge.
- Dashboard data comes from actual prototype records rather than hardcoded numbers.

---

## Demand forecasting and workforce allocation

We already have the ML model, so we integrate it rather than building another one.

```text
Historical Job Data
        │
        ▼
 Existing ML Model
        │
        ▼
 Demand Forecast
        │
        ▼
Compare with Worker Capacity
        │
        ▼
 Capacity Gap
        │
        ▼
Federation Recommendation
```

- Forecast can be shown by service, location and time period depending on the existing model output.
- Federation sees expected demand against available verified workforce.
- Example:

```text
             Demand       Capacity
Plumbing      HIGH          MEDIUM
Electrical    MEDIUM        HIGH
Cleaning      HIGH          LOW
Gardening     LOW           HIGH
```

- The output is used for workforce planning and allocation recommendations.
- No AI chatbot and no second ML model.

---

## Data model

```text
                           ┌───────────────┐
                           │  FEDERATION   │
                           └───────┬───────┘
                                   │
                           ┌───────▼───────┐
                           │   SOCIETIES   │
                           └───────┬───────┘
                                   │
                     ┌─────────────▼─────────────┐
                     │       WORKER PROFILE      │
                     │ membership · location     │
                     │ verification · availability│
                     └─────────────┬─────────────┘
                                   │
                           ┌───────▼───────┐
                           │ WORKER SKILLS │
                           └───────────────┘

┌──────────────┐                 ┌─────────────────┐
│   CUSTOMER   │────────────────▶│       JOB       │
└──────────────┘                 │ service         │
                                 │ location        │
                                 │ schedule        │
                                 │ worker          │
                                 │ status          │
                                 │ is_emergency    │
                                 │ allocation_score│
                                 └───┬────┬────┬────┘
                                     │    │    │
                           ┌─────────┘    │    └──────────┐
                           ▼              ▼               ▼
                      ┌─────────┐   ┌──────────┐    ┌─────────┐
                      │ PAYMENT │   │ WELFARE  │    │ RATING  │
                      │ base    │   │          │    │         │
                      │ surplus │   └──────────┘    └─────────┘
                      └────┬────┘
                           │
                           ▼
                      ┌─────────┐
                      │ INVOICE │
                      └─────────┘

┌──────────────────┐
│ SERVICE CATALOG  │──────────────▶ JOB
│ base_price        │
└──────────────────┘

┌──────────────────┐
│ DEMAND HISTORY   │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ EXISTING ML MODEL│
└────────┬─────────┘
         ▼
┌────────────────────────┐
│ FORECAST + WORKFORCE   │
│ PLANNING               │
└────────────────────────┘
```

Core entities:

```text
Federation
Society
User
CustomerProfile
WorkerProfile
WorkerSkill
ServiceCategory (base_price)
Job (is_emergency, allocation_score, allocation_breakdown)
Payment (base_price, surplus, welfare_contribution, worker_earning)
Invoice
WelfareContribution
InsuranceRecord
Rating
DemandHistory
```

- Customer and worker locations use PostGIS spatial fields.
- The ML model remains separate from transactional data and is accessed through its existing interface.

---

## Technology

```text
                 ONE PUBLIC ENTRY POINT
                         │
                  React / Next.js
             ┌───────────┼───────────┐
             │           │           │
          Customer     Worker    Federation
             │           │           │
             └───────────┼───────────┘
                         │
                    REST / HTTPS
                         │
                  Spring Boot API
                         │
              ┌──────────┴──────────┐
              │                     │
       PostgreSQL + PostGIS    Existing ML Model
```

- Frontend: React / Next.js
- Backend: Spring Boot / Java
- Database: PostgreSQL + PostGIS
- ML: existing team model
- Authentication: role-based access with OTP flow for the prototype
- Deployment: cloud-hosted frontend, backend and database

---

## Real vs prototype

| Component | Status |
|---|---|
| Customer interface | Real |
| Worker registration | Real |
| Society relationship | Real |
| Skill and verification records | Real |
| Booking and scheduling | Real |
| PostGIS matching | Real |
| Fair allocation (deterministic scoring) | Real |
| Emergency broadcast + atomic lock | Real |
| Emergency timeout + fallback | Real |
| Manual admin dispatch | Real |
| Job lifecycle | Real |
| Wage floor enforcement | Real |
| Invoice record | Real |
| Welfare ledger | Real |
| Rating | Real |
| Federation dashboard | Real |
| Existing ML integration | Real |
| OTP delivery | Simulated if necessary |
| Government verification | Mocked |
| Payment settlement | Sandbox/simulated |
| Insurance issuance | Prototype status only |

---

## What we are deliberately leaving out

- Separate Society application or dashboard
- Continuous live worker tracking
- Complex SOS command center
- Real government KYC integrations
- Real insurance issuance
- Production payment settlement
- Training academy
- Dynamic surge pricing (beyond the fixed emergency surcharge)
- Complex dispute management
- Cross-society worker borrowing
- AI chatbot
- New ML model
- Large numbers of unnecessary screens

---

## Build priority

The priority is to make the complete job flow actually work.

```text
WORKER
Register + Verify
      ↓
CUSTOMER
Book Service
      ↓
MATCHING
Deterministic Score (Proximity + Rating + Load) | Emergency Broadcast + Lock
      ↓
WORKER
Accept → Complete
      ↓
PAYMENT
Base Price Floor + Surplus Split (Welfare / Worker) + Invoice
      ↓
RATING
      ↓
FEDERATION
Jobs + Workforce + Welfare + Emergency Fallback
      ↓
ML
Demand Forecast + Workforce Planning
```

This is the flow the final demo should prove end-to-end.
