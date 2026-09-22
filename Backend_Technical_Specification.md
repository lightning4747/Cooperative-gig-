# Problem Statement ID: 26089
## Cooperative Gig Services Platform for Household & Community Services
**Ministry of Cooperation | National Council for Cooperative Training (NCCT)**
**Theme:** Agriculture, FoodTech & Rural Development | **Category:** Software

---

# Product Blueprint & Master Reference Book

---

## 1. What We Are Building

We are building a cooperative-owned services marketplace that connects customers with verified cooperative trade workers.

We are keeping the product to **three interfaces**:
- **Customer** — discover services, book (standard or emergency), verify arrival via OTP, pay, and rate.
- **Worker** — register with society & e-Shram, manage availability, receive fair job offers, enter OTP, and track earnings & welfare.
- **Federation Admin** — manage worker verification, inspect spatial matching & welfare, and view AI demand forecasts.

A society is the organizational relationship between a worker and the federation. Societies manage their local worker pool, while the federation provides centralized oversight.

```text
                                  COOPGIG
                                     │
             ┌───────────────────────┼───────────────────────┐
             │                       │                       │
          CUSTOMER                WORKER                 FEDERATION
     (Mobile App / PWA)      (Mobile App / PWA)       (Web Admin Console)
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                              Spring Boot API
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
           PostgreSQL + PostGIS              Existing ML Model
         (GEOGRAPHY Point, 4326)         (Demand Forecast & Gaps)
```

---

## 2. Core Job Flow

The prototype revolves around one complete, end-to-end job lifecycle:

```text
[WORKER]
Register (Name, Phone, Society, Member ID, e-Shram UAN)
        ↓
Skills Profile & Verification
        ↓
Active & Available

[CUSTOMER]
Select Language (English / Hindi / Tamil)
        ↓
Select Service & Booking Type (Standard or Emergency)
        ↓
Location (GPS / Address) → Book

                         ↓
                 MATCHING ENGINE
                         ↓
       Skill + Verification + Availability
           + PostGIS Radius Search
   + Weighted Fairness Score (or Emergency Broadcast)
                         ↓
                  Worker Selected
                         ↓
                  Worker Accepts
                         ↓
                    Travelling
                         ↓
                     Arrived
                         ↓
              Doorstep 6-Digit Mutual OTP
                         ↓
                    In Progress
                         ↓
                     Completed
                         ↓
       Payment + Base Price Wage Floor Check
                         ↓
    Welfare Contribution Deducted from Surplus
                         ↓
                  Digital Invoice
                         ↓
               1–5 ★ Customer Rating
                         ↓
                 Federation Dashboard
                         ↓
             AI Demand Forecast & Planning
```

---

## 3. Multilingual Support (3 Languages)

To keep the prototype clean while fully addressing NCCT and field accessibility requirements, the mobile interfaces support **3 languages**:
- **English (`en`)**
- **Hindi (`hi`)**
- **Tamil (`ta`)**

Language toggle is accessible directly on app launch and within profile settings. The Worker interface emphasizes large buttons, icons, and clear audio alerts for semi-literate users.

---

## 4. Customer Experience

- Customer selects preferred language (English, Hindi, Tamil).
- Browses 10 service categories (Plumbing, Electrical, Carpentry, Painting, Domestic Help, Caregiving, Driving, Gardening, Cleaning, Technician).
- Selects a specific service.
- Chooses booking mode:
  - **Standard Scheduled:** Select preferred date and time slot.
  - **On-Demand:** Immediate service request.
  - **Emergency:** High-priority booking for domestic hazards (e.g., pipe burst, electrical short circuit), priced at a surcharge over the standard base price (see §9.2).
- Sets service location via interactive map or device GPS (saved as PostGIS `GEOGRAPHY(Point, 4326)`).
- Previews transparent pricing (base wage guarantee + welfare cess, or emergency-adjusted price).
- Confirms booking. The platform matches the worker automatically (no manual searching/haggling).
- Customer tracks status: `Searching` $\to$ `Assigned` $\to$ `Travelling` $\to$ `Arrived`.
- Upon worker arrival, customer sees a **6-digit Doorstep Mutual OTP** to share with the worker.
- After completion, customer pays digitally, downloads the itemized invoice, and submits a **1–5 star rating with optional feedback**.

---

## 5. Worker Experience

- Worker registers with name, phone, registered society, membership ID, skills, and **12-digit e-Shram UAN**.
- Worker status starts as `PENDING_VERIFICATION`.
- Society / Federation checks membership and verified trade competency $\to$ worker becomes `ACTIVE`.
- Worker sets shift availability: `Online` or `Offline`.
- When a job is matched:
  - **Standard Job Card:** Shows service, neighborhood, distance, time, and guaranteed payout (satisfying the wage floor).
  - **Emergency Job Card:** Displays a red Emergency banner with an audible chime, the emergency-premium payout, and a 60-second acceptance countdown.
- Worker accepts or declines the offer.
- Worker moves status: `Travelling` $\to$ `Arrived`.
- At customer doorstep, worker prompts customer for the **6-digit OTP** and enters it to transition job to `In Progress`.
- After finishing repairs, worker marks `Completed`.
- Worker views earnings, accumulated **Welfare Fund balance**, and enrollment status for **PMSBY** (accident insurance) and **PMJJBY** (life insurance).

---

## 6. Service Catalog

| Category | Example Services |
|---|---|
| **Plumbing** | Pipe burst (Emergency), tap repair, drain blockage, bathroom fitting |
| **Electrical** | Short circuit (Emergency), fan repair, MCB wiring, switchboard fix |
| **Carpentry** | Door lock jamming (Emergency), furniture assembly, drilling, hinge repair |
| **Painting** | Wall painting, dampness patch, touch-up, door/window polish |
| **Domestic Help** | Housekeeping, cooking assistance, laundry, general household help |
| **Caregiving** | Elderly care, patient assistance, child care, mobility support |
| **Driving** | Local driver, outstation travel, pickup/drop, emergency transit |
| **Gardening** | Lawn trimming, terrace garden maintenance, pruning, pest control |
| **Cleaning** | Deep cleaning, water tank cleaning, bathroom/kitchen sanitation |
| **Technician** | CCTV fix, Wi-Fi router setup, water purifier service, appliance repair |

---

## 7. Matching, PostGIS Location & Emergency Protocol

```text
                     CUSTOMER SERVICE REQUEST
                                │
                                ▼
                    Check Required Trade Skill
                                │
                                ▼
                     Filter Active & Verified
                                │
                                ▼
                     Filter Online Workers
                                │
                                ▼
               PostGIS Radius Search (in meters)
        ST_DWithin(worker_loc, customer_loc, :radiusMeters)
                                │
                ┌───────────────┴───────────────┐
                │                               │
       [STANDARD BOOKING]              [EMERGENCY BOOKING]
                │                               │
                ▼                               ▼
      Weighted Fair Allocation Score   Priority Broadcast + Lock
      • Proximity (W1 = 0.5)           • ALL available workers <= 5 km
      • Rating (W2 = 0.3)              • Atomic first-accept lock
      • Daily Load Penalty (W3 = 0.2)  • 60–90s window, then cascade/fallback
                │                               │
                └───────────────┬───────────────┘
                                │
                                ▼
                         Selected Worker
                    (score + breakdown logged)
```

### 7.1. PostGIS Spatial Precision: `GEOGRAPHY(Point, 4326)`
To keep spatial queries highly efficient, accurate, and simple without complex map projection math:
- Coordinates are stored as `GEOGRAPHY(Point, 4326)`.
- Distance filtering uses native meter calculations directly:
  ```sql
  ST_DWithin(w.current_location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)
  ```
  *(e.g., `:radiusMeters = 5000` for 5 km emergency radius, `10000` for 10 km standard radius).*
- Ordering uses native spheroid distance in meters:
  ```sql
  ST_Distance(w.current_location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) ASC
  ```

### 7.2. Fair Allocation — Deterministic Weighted Scoring

Standard (non-emergency) allocation uses a single deterministic formula over the eligible pool — no ML, no black box, fully explainable to the federation.

**Hard filters first (gate, not weighted):**
```text
1. Has required skill (verified)
2. Status = ACTIVE / VERIFIED
3. Status = Online / Available
4. Within configured service radius (ST_DWithin)
```

**Score the remaining pool:**
```text
Score = (W1 × ProximityScore) + (W2 × RatingScore) − (W3 × DailyLoadPenalty)
```

| Factor | Weight | Direction | Definition |
|---|---|---|---|
| ProximityScore | W1 = 0.5 | higher is better | Normalized inverse of `ST_Distance` within radius (closer = higher score) |
| RatingScore | W2 = 0.3 | higher is better | Worker's rolling average rating (`avg_rating`), normalized 0–1 |
| DailyLoadPenalty | W3 = 0.2 | higher is worse | Increases with jobs already completed/active today, preventing overload and spreading work across the pool |

- Highest score wins the offer.
- Proximity dominates by design (customers feel wait time most); rating supports but can't decide alone; load penalty exists specifically so one high-rated nearby worker doesn't absorb every job in a zone.
- The winning worker's raw score and each component's contribution are stored against the job (`allocation_score`, `allocation_breakdown`), so the federation dashboard can show *why* that worker was picked.
- Weights (W1/W2/W3) are federation-configurable, not hardcoded — retunable without a redeploy.
- 7-day workload and time-since-last-job (from the original rotation model) roll into `DailyLoadPenalty` as the load-balancing signal.

### 7.3. Emergency Dispatch Protocol

Emergency bookings bypass standard scoring entirely and use a **broadcast + lock** model — urgency needs speed over fairness rotation.

- **Broadcast:** Concurrently pushed (notification + audible chime) to **all available, skilled workers within 5 km** — not sequential, not limited to top 3.
- **Atomic accept lock:** Backend enforces an atomic state lock on the job — the first worker to tap "Accept" wins it; the write must be atomic (conditional update / row lock) so two simultaneous accepts can't both succeed. The job is immediately cleared from every other worker's screen on lock.
- **Timeout:** Hard 60–90 second window. If unaccepted, the customer's UI updates directly: `No emergency workers nearby` — the request does not hang indefinitely. Customer may retry, widen radius, or fall back to standard booking.
- **Manual dispatch fallback:** If the broadcast times out unfulfilled, the job is flagged on the Federation Admin Dashboard as an **unfulfilled emergency**, so a human admin can manually phone/dispatch an available worker. The manual intervention (who, how, when) is logged against the job.
- Emergency jobs carry a **price premium** over the standard base price (surcharge or multiplier, federation-configured) — see §9.2 for how this flows through the wage floor split.

```text
EMERGENCY JOB CREATED
        │
        ▼
Broadcast to all available + skilled workers <= 5 km
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

---

## 8. Job Lifecycle & Doorstep OTP

```text
SEARCHING → OFFERED → ACCEPTED → TRAVELLING
                                      ↓
                                  ARRIVED
                                      ↓
                         Doorstep 6-Digit Mutual OTP
                                      ↓
                                IN_PROGRESS
                                      ↓
                                 COMPLETED
```

- **Supporting states:** `CANCELLED`, `EXPIRED`.
- Emergency jobs use `BROADCAST` in place of `OFFERED` (concurrent multi-worker offer with atomic lock, instead of a single sequential offer); the same downstream states apply from `ACCEPTED` onward.
- **Doorstep Mutual OTP:** When worker marks `ARRIVED`, a secure 6-digit OTP is generated on the customer's screen. Worker enters this OTP to unlock `IN_PROGRESS`. This ensures physical presence and customer safety without continuous battery-draining GPS streaming.

---

## 9. Payment, Wage Floor & Transparent Invoicing

```text
                         GROSS CUSTOMER PAYMENT
                                    │
                                    ▼
                    Federation Base Price (= Wage Floor)
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
             Guaranteed to Worker              Surplus (if any)
           (never touched by welfare)      (GrossPayment − BasePrice)
                                                    │
                                    ┌───────────────┴───────────────┐
                                    ▼                               ▼
                          Welfare Contribution              Remainder to Worker
                           (from surplus only)              (on top of base)
```

### 9.1. Base Price = Wage Floor

- The federation fixes a **base price per service/trade**. This base price *is* the worker's guaranteed wage floor for that job — the worker receives at least the base price no matter what.
- Any amount the customer pays **above** the base price is the **surplus**. Welfare contribution is deducted only from the surplus; the remainder of the surplus is paid to the worker on top of the base price.

**Worked example:**
```text
Customer pays:          1200
Federation base price:  1000   → guaranteed worker floor
Surplus:                 200   (1200 − 1000)
Welfare contribution:    100   (deducted from surplus)
Worker take-home:       1100   (1000 base + 100 remaining surplus)
```

**Formula:**
```text
Surplus              = GrossPayment − BasePrice
WelfareContribution  = f(Surplus)          // federation-configured rate/rule
WorkerEarning        = BasePrice + (Surplus − WelfareContribution)

Constraint (always holds):
WorkerEarning >= BasePrice
```

- The wage floor is structural, not a post-hoc check: welfare is only ever taken from the surplus, never from the guaranteed base price. There is no path in this formula where the worker earns below the base price.
- If `GrossPayment == BasePrice` (no surplus), welfare contribution is 0 and the worker earns exactly the base price.
- **`f(Surplus)` — welfare rate:** federation-configured (flat % of surplus by default in the prototype; tiered rules are a config extension, not a schema change).

### 9.2. Emergency Pricing

- Emergency bookings price at `GrossPayment = StandardBasePrice + EmergencySurcharge`, where the surcharge is federation-configured (flat amount or multiplier).
- The worker's floor stays the **standard base price** for that trade — the emergency premium flows through as additional surplus, split between welfare and worker using the same §9.1 formula.
- This keeps one wage-floor mechanism for both booking types; emergency pricing only changes the surplus pool, not the guarantee.

### 9.3. Digital Invoice

Contains Invoice #, Society Registration #, Worker e-Shram reference, base price, surplus, welfare contribution, worker earning, and tax breakdown.

> **Note:** This supersedes the flat 92/3/5 platform-fee split in earlier drafts. The base-price-as-floor model guarantees the wage floor structurally (welfare can never eat into it), whereas a flat percentage split does not guarantee a floor on its own. A federation operating levy can still be layered in as a configured deduction from the surplus alongside welfare, if the federation wants one — schema supports it (`platform_fee` field retained in Payment, defaulting to 0 in the prototype).

---

## 10. Worker Welfare, e-Shram & Social Security

```text
JOB COMPLETED
      ↓
Welfare Contribution Calculated (from surplus, see §9.1)
      ↓
Worker Welfare Ledger Updated
      ↓
Insurance & Social Security Status Updated
```

- **e-Shram UAN:** Captured during worker registration and stored on the profile.
- **Welfare Ledger:** Transparent account where the surplus-derived welfare contribution from every job is credited for emergency medical or tool assistance.
- **Micro-Insurance:** Tracks worker eligibility and enrollment status for national schemes:
  - **PMSBY:** Pradhan Mantri Suraksha Bima Yojana (Accident cover).
  - **PMJJBY:** Pradhan Mantri Jeevan Jyoti Bima Yojana (Life cover).

---

## 11. Rating & Feedback

- **One-Way Rating:** Customer submits a **1–5 Star Rating + Optional Feedback** upon job completion.
- Stored against the completed job and worker profile.
- Feeds `RatingScore` in the §7.2 allocation formula (weighted at W2 = 0.3) — a quality safeguard and matching input, never the sole factor in job allocation.

---

## 12. Federation Admin Dashboard

The federation dashboard provides a centralized operational view:

```text
┌─────────────────────────────────────────────────────────┐
│                  FEDERATION DASHBOARD                   │
├──────────────┬──────────────┬──────────────┬───────────┤
│ Active       │ Jobs Today   │ Available    │ Welfare   │
│ Workers      │              │ Workers      │ Ledger    │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│ [INTERACTIVE MAP VIEW]                                  │
│ Real-time cluster of available & active workers         │
│ (Agnostic map component — provider to be configured)    │
│                                                         │
│ Worker Verification Queue    Society Workforce         │
│ • Review Trade & e-Shram     • Filter by Society       │
│ • Approve / Reject           • Track Work Distribution │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Demand Forecast (ML)         Capacity Planning         │
│ Plumbing (Emergency)  HIGH   32 Available (GAP)        │
│ Electrical            MED    60 Available (OPTIMAL)    │
├─────────────────────────────────────────────────────────┤
│ Unfulfilled Emergencies (flagged for manual dispatch)   │
│ Allocation Weights Config (W1 / W2 / W3, base prices)   │
└─────────────────────────────────────────────────────────┘
```

- **Map View:** Interactive map showing worker locations and job clusters (provider-agnostic component; map provider to be finalized).
- **Society Filter:** Federation can filter workers, verification queues, and jobs by primary society.
- **Welfare Ledger:** View aggregate social security accumulations and adjudicate claims.
- **Allocation Inspection:** Federation can inspect any job's `allocation_score` and `allocation_breakdown` to see why a worker was chosen.
- **Unfulfilled Emergencies:** Queue of timed-out emergency broadcasts awaiting manual dispatch.
- **Config:** Federation sets base price per service (= wage floor), welfare rate, allocation weights (W1/W2/W3), and emergency surcharge — all without redeploy.

---

## 13. Demand Forecasting & Workforce Allocation

Integrates the team's existing ML model to predict demand and highlight capacity deficits:

```text
Historical Job Data
        │
        ▼
 Existing ML Model
        │
        ▼
 Demand Forecast (by Trade & Area)
        │
        ▼
Compare with Scheduled Worker Capacity
        │
        ▼
 Identify Capacity Gaps
        │
        ▼
Federation Actionable Recommendations
```

- Compares projected demand against available verified workers per trade.
- Allows federation to alert societies to mobilize workers in high-demand zones.

---

## 14. Data Model

Core entities:
- **Federation** (`id`, `name`, `registration_no`, `state`)
- **Society** (`id`, `federation_id`, `name`, `registration_no`, `district`)
- **User** (`id`, `phone`, `role`, `preferred_lang`)
- **CustomerProfile** (`id`, `user_id`, `name`, `location`)
- **WorkerProfile** (`id`, `user_id`, `society_id`, `eshram_uan`, `verification_status`, `is_available`, `current_location: GEOGRAPHY(Point, 4326)`, `avg_rating`)
- **WorkerSkill** (`id`, `worker_id`, `category_id`, `verified`)
- **ServiceCategory** (`id`, `name`, `base_price`)
- **Job** (`id`, `customer_id`, `worker_id`, `category_id`, `booking_type: STANDARD | ON_DEMAND | EMERGENCY`, `status`, `service_location: GEOGRAPHY(Point, 4326)`, `scheduled_time`, `doorstep_otp`, `allocation_score`, `allocation_breakdown_json`)
- **Payment** (`id`, `job_id`, `gross_amount`, `base_price`, `surplus`, `welfare_contribution`, `worker_earning`, `platform_fee`)
- **Invoice** (`id`, `job_id`, `invoice_number`, `society_registration_no`, `breakdown_json`)
- **WelfareLedger** (`id`, `worker_id`, `balance`, `pmsby_status`, `pmjjby_status`)
- **Rating** (`id`, `job_id`, `stars`, `feedback`)
- **DemandHistory** (`id`, `category_id`, `area`, `date`, `job_count`)
- **AllocationConfig** (`id`, `w1_proximity`, `w2_rating`, `w3_load_penalty`, `welfare_rate`, `emergency_surcharge`, `emergency_radius_m`, `emergency_timeout_s`)

---

## 15. Technology Stack

- **Mobile Application (Customer & Worker):** Cross-platform Mobile App / PWA (Flutter / React) with 3 languages (`en`, `hi`, `ta`).
- **Admin Console:** Responsive Web Dashboard with configurable interactive map component.
- **Backend API:** Java 21 & Spring Boot 3.5 (REST API, JWT security, state machine).
- **Spatial Database:** PostgreSQL 16 + PostGIS with `GEOGRAPHY(Point, 4326)` for meter-based distance calculations.
- **AI/ML:** Integrated existing team demand forecasting model.

---

## 16. Real Implementation vs. Prototype Scope

| Component | Prototype Status | Real-World Target |
|---|---|---|
| **Customer App** | Real | Production App / PWA |
| **Worker App** | Real | Production App / PWA |
| **Multilingual (EN, HI, TA)** | Real | 3 core regional languages |
| **Emergency Booking (broadcast + atomic lock)** | Real (Urgency flag, all-worker broadcast, 60–90s timer, manual fallback) | Emergency dispatch system |
| **Doorstep Mutual OTP** | Real (6-digit check-in) | Doorstep mutual verification |
| **PostGIS Spatial Search** | Real (`GEOGRAPHY Point, 4326` meter search) | GPS spatial engine |
| **Fair Allocation (weighted scoring)** | Real (Proximity/Rating/Load formula, config weights) | Explainable algorithmic fairness |
| **Wage Floor Enforcement (base price model)** | Real (Structural floor via base price + surplus split) | Statutory labor wage floor |
| **Welfare Contribution** | Real (Calculated from surplus, credited to ledger) | Cooperative social security fund |
| **e-Shram Integration** | Real UAN format validation & mock verification | e-Shram API integration |
| **Insurance Status** | Real (PMSBY/PMJJBY status tracker) | Insurer direct link |
| **Digital Payments** | Real simulated sandbox split | UPI / Escrow payment gateway |
| **Customer Rating** | Real (1–5 stars + feedback) | Quality feedback loop |
| **Federation Dashboard** | Real (Operations, verification, map, allocation config, unfulfilled emergencies) | Apex Federation console |
| **Demand Forecasting** | Real (Existing ML model integration) | Automated dispatch planning |

---

## 17. What We Are Deliberately Leaving Out

To keep the prototype sharp, focused, and reliable:
- No separate Society web application (societies are managed via Federation dashboard filters).
- No continuous live vehicle GPS breadcrumb tracking (Doorstep OTP guarantees physical arrival).
- No worker-rating-customer flow (keeps feedback simple and one-way).
- No live government KYC or production insurance underwriting APIs (mocked with realistic schemas).
- No customer-worker chatbot (clean status updates replace chat).
- No dynamic surge pricing beyond the fixed, federation-configured emergency surcharge.

---

## 18. Build Priority & Demo Flow

The end-to-end verification proves this flow:

```text
WORKER ONBOARDING
Register with Society + e-Shram UAN → Verified → Active & Available
                       ↓
CUSTOMER BOOKING
Select Language (EN/HI/TA) → Choose Service → Standard / Emergency → Location Pin
                       ↓
MATCHING
PostGIS GEOGRAPHY Radius Search → Weighted Fair Allocation (or Emergency Broadcast + Lock)
                       ↓
EXECUTION
Worker Accepts → Travelling → Arrived → Doorstep 6-Digit OTP Verified → Complete
                       ↓
PAYMENT & WELFARE
Enforce Base-Price Wage Floor → Welfare from Surplus → Worker Keeps Remainder → Digital Invoice
                       ↓
RATING
Customer rates 1–5 Stars
                       ↓
FEDERATION & ML
View Live Map, Allocation Log & Welfare Ledger → Resolve Unfulfilled Emergencies → Inspect AI Demand Forecast & Capacity Gaps
```

---
*Document Version: 2.2 (Wage floor formalized as base-price structural guarantee; deterministic weighted allocation scoring; emergency broadcast + atomic-lock + manual-fallback protocol added — SIH26089)*
