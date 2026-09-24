# SIH PS 26089 — Cooperative Gig Services Platform
## Demonstration Guide, Seed Dataset & Reset Mechanism

This document provides complete instructions for demonstrating the **Cooperative Gig Services Platform** (SIH PS 26089). The platform includes a realistic, right-sized demo dataset, pre-configured demo personas, and an idempotent reset mechanism.

---

### Step 0: Backend Detection Summary

> **Architecture in Use:** Real Spring Boot 3.5.16 + PostgreSQL 16.9 / PostGIS Backend  
> The deployed build and local dev environment run against the real relational database on port `5432` with Flyway migrations and Spring Boot on port `8080`, proxied via Vite on port `3000`.

---

### 1. Pre-Configured Demo Personas

All accounts use the universal fixed verification code **`123456`** in demo mode. The sign-in page (`/login`) includes 1-click role selection that automatically fills the primary phone numbers.

| Role | Persona Name | Mobile Number | OTP Code | Description & Neighbourhood |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** *(Main Demo)* | **Meena** | `9000000001` | `123456` | RS Puram resident (`142 DB Road, RS Puram`). Pre-verified account with 3 completed past bookings in history. |
| **Worker** *(Verified Demo)* | **Arun Electrician** | `9000000011` | `123456` | Senior verified electrician in RS Puram (< 200m from Meena). High rating (4.92★) and fully enrolled in PMSBY/PMJJBY insurance. |
| **Worker** *(Demand Surge)* | **Karthik Plumber** | `9000000015` | `123456` | Sole active plumber in Saibaba Colony (`NSR Road`). Experiences high monsoon demand surge in historical data. |
| **Worker** *(Live Registration)* | **Ravi** | `9000000099` | `123456` | **NOT pre-seeded.** Reserved for live sign-up during presentation, followed by live admin verification. |
| **Federation Admin** | **Federation Admin** | `9000000000` | `123456` | State Labour Cooperative Federation Administrator with oversight across all 3 societies. |
| **Customer** *(Secondary)* | Senthil Nathan | `9000000002` | `123456` | Gandhipuram resident with active in-progress job. |
| **Pending Worker 1** | Prakash Kumar | `9000000035` | `123456` | Plumber in Gandhipuram awaiting society verification. |
| **Pending Worker 2** | Geetha Sundaram | `9000000036` | `123456` | Caregiver in Saibaba Colony awaiting society verification. |

*(Legacy compatibility aliases `9876543200` for Admin and `9876543210` for Customer are also retained).*

---

### 2. Demo Seed Dataset Characteristics

* **1 Regional Federation**: *Coimbatore District Labour & Services Cooperative Federation* (Registration: `TN-FED-2022-001`).
* **3 Area Cooperative Societies**:
  1. *Gandhipuram Labour & Artisans Cooperative Society* (Registration: `TN-CBE-2023-011`, Gandhipuram: `11.0183° N, 76.9644° E`)
  2. *RS Puram Cooperative Workers Union* (Registration: `TN-CBE-2023-042`, RS Puram: `11.0088° N, 76.9482° E`)
  3. *Saibaba Colony Cooperative Labour Guild* (Registration: `TN-CBE-2024-025`, Saibaba Colony: `11.0298° N, 76.9452° E`)
* **24 Verified Workers across 6 Services**:
  * Electrical: 4 workers (Arun, Murugan, Deepa, Rajesh)
  * Plumbing: 4 workers (Karthik in Saibaba Colony; Saravanan and Vignesh in RS Puram; Manikandan in Gandhipuram)
  * Carpentry: 4 workers (Selvam, Mani, Natarajan, Anand)
  * Painting: 4 workers (Ramu, Suresh, Revathi, Lakshmi)
  * House Cleaning / Domestic Help: 4 workers (Kavitha, Malathi, Shanthi, Radha)
  * Caregiving: 4 workers (Meenakshi, Bhavani, Vasantha, Uma)
* **2 Pending Verification Workers**:
  * Prakash Kumar (`9000000035`, Plumbing) and Geetha Sundaram (`9000000036`, Caregiving) are pre-seeded in the Admin Verification Queue.
* **178 Total Bookings across the past 12 weeks**:
  * Relative timestamps calculated dynamically from `now()` (never hardcoded calendar dates).
  * ~158 completed with 100% floor wage settled, zero platform deduction, and collective welfare contribution credited.
  * 16 cancelled (~10%) with realistic cancellation reasons.
  * 4 active/in-progress jobs so the live monitoring dashboard is never empty.
* **The Demand Surge Story**:
  * In Saibaba Colony, 40 plumbing requests were logged over the last 21 days (weeks 10–12).
  * Saibaba Colony has only **1 verified plumber** (Karthik), while adjacent RS Puram has 2 plumbers with low utilization.
  * This highlights the core problem statement: inter-society allocation and cross-skilling recommendations in the Federation Admin matrix.

---

### 3. Geolocation & Fallback Behavior

* All coordinates are bounded within Coimbatore (`10.95° N to 11.08° N, 76.90° E to 77.05° E`).
* If browser geolocation is denied, times out, or resolves outside Coimbatore (e.g. evaluator running from another city), the frontend automatically falls back to Gandhipuram (`11.0183, 76.9644`) and displays a non-intrusive notification:
  > *"Using Coimbatore demo location (change in settings)"*

---

### 4. Demo Reset Mechanism (3 Callable Methods)

The reset mechanism is idempotent, takes **< 1 second**, resets sequence counters, and restores the exact baseline state.

#### Method 1: CLI Command
Run from either the root directory or the `frontend/` directory:
```bash
npm run demo:reset
```

#### Method 2: API Endpoint
Protected by `X-Demo-Reset-Token` (returns `404` when `DEMO_MODE=false` and `401` if token is invalid):
```bash
curl -X POST http://localhost:8080/api/demo/reset \
  -H "Content-Type: application/json" \
  -H "X-Demo-Reset-Token: cooperative-demo-reset-2026"
```

#### Method 3: UI Button in Federation Admin
1. Sign in as Admin (`9000000000`).
2. Go to **Settings** (`/federation/settings`).
3. Scroll to **3. Demo Dataset Controls**.
4. Click **Reset Demo Data**.
5. Confirm the dialog: *"This will restore the demo dataset. Any live data will be replaced. Continue?"*.
6. A success toast confirms data restoration.

#### Auto-Reset on Boot
Whenever the backend starts up with `DEMO_MODE=true` (the default), `DemoDataSeeder` automatically bootstraps the database to this baseline.

---

### 5. Step-by-Step Video Demo Walkthrough (3-5 Minutes)

#### Act 1: Customer Booking Experience (Meena)
1. Navigate to `/login`.
2. Click **Customer** tab (phone auto-fills to `9000000001`, OTP `123456`). Click **Sign In**.
3. Point out Meena's past completed jobs (switchboard repair, tap repair, deep cleaning).
4. Tap **Electrical** -> **Switchboard repair**.
5. Select **On-Demand Doorstep Service** -> confirm RS Puram address.
6. Submit booking -> Platform dispatches immediately to nearby verified technician **Arun Electrician** (< 200m away).

#### Act 2: Worker Perspective & Transparent Earnings (Arun)
1. Log out or open an incognito window -> `/login`.
2. Click **Worker** tab (phone auto-fills to `9000000011`, OTP `123456`). Click **Sign In**.
3. Show Arun's active work profile, 4.92★ rating, and enrolled welfare schemes (PMSBY / PMJJBY).
4. Point out the earnings ledger: 100% statutory floor wage protected, transparent customer payment, and collective welfare pool contribution.

#### Act 3: Live Worker Onboarding (Ravi)
1. Navigate to `/login` -> click **Worker** -> **Worker Sign Up** (`/register/worker`).
2. Sign up **Ravi** with mobile number **`9000000099`**, name *"Ravi Electrician"*.
3. Enter OTP `123456`.
4. Fill onboarding details: select **RS Puram Cooperative Workers Union**, Trade: **Electrical**, Membership ID: `MEM-CBE-099`.
5. Submit application -> Status displays: *"Verification Pending by Cooperative Federation"*.

#### Act 4: Federation Admin Oversight & Demand Surge Analysis (Admin)
1. Navigate to `/login` -> click **Admin** tab (phone auto-fills to `9000000000`, OTP `123456`). Click **Sign In**.
2. Go to **Verification Queue** (`/federation/verifications`):
   - Notice **Ravi (`9000000099`)** appears in the queue alongside pre-seeded applicants (Prakash and Geetha).
   - Click **Approve** on Ravi -> status immediately updates to `ACTIVE`.
3. Go to **Forecast & Capacity Analytics** (`/federation/forecast`):
   - Highlight the **Plumbing Demand Surge** in Saibaba Colony (40+ recent bookings vs 1 plumber).
   - Show how the algorithm flags a `GAP` in Saibaba Colony while RS Puram has available capacity, prompting inter-society reallocation recommendations.
4. Go to **Settings** (`/federation/settings`):
   - Review fair base rate controls and welfare contribution share (default 50% of surplus).

#### Act 5: Clean Reset Demonstration
1. In Federation Admin **Settings**, scroll to **Demo Dataset Controls**.
2. Click **Reset Demo Data** -> Confirm dialog.
3. Show that Ravi is wiped, Meena's profile is returned to baseline, and all historical records are restored cleanly.
