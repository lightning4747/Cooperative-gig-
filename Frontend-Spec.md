# SIH 26089 — Cooperative Gig Services Platform for Household & Community Services

**Build a professional, production-quality frontend prototype**

- **Problem Statement ID:** 26089
- **Problem Statement:** Cooperative Gig Services Platform for Household & Community Services
- **Organization:** Ministry of Cooperation
- **Department:** National Council for Cooperative Training (NCCT)
- **Category:** Software
- **Theme:** Agriculture, FoodTech & Rural Development

The application is a cooperative-owned digital service marketplace connecting customers with verified cooperative workers for household and community services.

---

## 1. Critical Product Rules

The application has exactly **three interfaces**:

1. Customer
2. Worker
3. Federation Admin

There is **NO** separate Society application or Society dashboard.

A Society is an organizational relationship between a worker and the Federation. Societies manage their local worker pool organizationally, while the Federation provides centralized administration and oversight.

The frontend must **NOT** contain any branding or terminology called:

- CoopGig
- COOPGIG
- CG
- Coop Gig
- any invented startup/product name

Use the official problem/domain terminology instead:

- Cooperative Services
- Cooperative Service Platform
- Federation
- Society
- Customer
- Worker
- Household & Community Services

The product should feel like a serious national cooperative digital platform, not a startup mockup.

---

## 2. Frontend Technology

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Router
- TanStack Query
- Axios
- Zustand only where genuinely necessary
- React Hook Form
- Zod
- i18next / react-i18next

Use a professional responsive web architecture.

The Customer and Worker experiences should be mobile-first and work extremely well on mobile-sized screens.

The Federation Admin interface should be desktop-first and responsive.

---

## 3. Backend Is Not Ready Yet

**IMPORTANT:** The Spring Boot backend is still under development. The final API endpoints have **NOT** been finalized.

Therefore:

- DO NOT invent or hardcode final API endpoints.
- DO NOT scatter fetch/axios calls throughout UI components.
- Create a clean service abstraction.

**Architecture:**

```
UI
  ↓
Hooks
  ↓
Service Layer
  ↓
Mock API Adapter initially
  ↓
Future Spring Boot REST API
```

Create `src/services/`:

- `authService.ts`
- `customerService.ts`
- `workerService.ts`
- `jobService.ts`
- `paymentService.ts`
- `federationService.ts`
- `forecastService.ts`

Initially these services should use realistic mock data. The UI must work completely without a backend. Later the implementation should allow the mock service implementation to be replaced with real Spring Boot API calls without rewriting the UI.

Use TypeScript domain models as the contract between frontend and backend.

---

## 4. Application Routing

Use role-based routing.

**Customer**

```
/customer
/customer/services
/customer/services/:categoryId
/customer/services/:categoryId/:serviceId
/customer/booking
/customer/booking/location
/customer/booking/confirmation
/customer/jobs/:jobId
/customer/jobs/:jobId/tracking
/customer/jobs/:jobId/otp
/customer/jobs/:jobId/payment
/customer/jobs/:jobId/invoice
/customer/jobs/:jobId/rating
/customer/profile
```

**Worker**

```
/worker
/worker/register
/worker/verification
/worker/jobs
/worker/jobs/:jobId
/worker/jobs/:jobId/travelling
/worker/jobs/:jobId/arrival
/worker/jobs/:jobId/complete
/worker/earnings
/worker/welfare
/worker/profile
```

**Federation**

```
/federation
/federation/workers
/federation/verification
/federation/societies
/federation/jobs
/federation/emergencies
/federation/allocation
/federation/welfare
/federation/forecast
/federation/configuration
```

---

## 5. Service Catalog — Important

The service hierarchy **MUST** be:

```
CATEGORY
  ↓
SUBSERVICE
```

Do NOT flatten all services into one list. The customer first selects a category, then selects a specific subservice.

| Category | Subservices |
|---|---|
| Plumbing | Pipe leakage, Tap repair, Drain blockage, Bathroom fitting, Pipe burst |
| Electrical | Fan repair, MCB wiring, Switchboard repair, Short circuit |
| Carpentry | Furniture assembly, Drilling, Hinge repair, Door repair, Door lock jamming |
| Painting | Wall painting, Dampness patching, Touch-up, Door/window polishing |
| Domestic Help | Housekeeping, Cooking assistance, Laundry, General household help |
| Caregiving | Elderly care, Patient assistance, Child care, Mobility support |
| Driving | Local driver, Outstation travel, Pickup/drop, Emergency transit |
| Gardening | Lawn trimming, Terrace garden maintenance, Pruning, Garden maintenance |
| Cleaning | Deep cleaning, Water tank cleaning, Bathroom sanitation, Kitchen sanitation |
| Technician | CCTV repair, Wi-Fi router setup, Water purifier service, Appliance repair |

Each subservice must have:

- id
- categoryId
- name
- description
- fixed base price
- estimated duration
- whether emergency booking is supported

Do NOT display all subservices at once on the home page.

**Flow:** Service Category → Subservice → Booking Type → Location → Confirmation

---

## 6. Pricing Model — Simplified Prototype

**IMPORTANT:**

- Do NOT implement dynamic pricing.
- Do NOT implement emergency surcharge.
- Do NOT implement surge pricing.
- Do NOT implement configurable emergency pricing.
- Do NOT create W1/W2/W3 pricing or allocation controls.

Every subservice has a fixed configured base price.

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

Emergency booking does NOT change the price. Standard, On-Demand and Emergency booking can use the same fixed subservice price.

---

## 7. Booking Types

Customers can select:

**Standard Scheduled** — customer selects date and time slot

**On-Demand** — immediate service request

**Emergency** — immediate high-priority service request

Emergency is about dispatch priority, NOT price. There is:

- NO emergency surcharge
- NO dynamic pricing
- NO surge pricing

---

## 8. Customer Experience

The customer journey:

```
Language
  ↓
Home
  ↓
Service Category
  ↓
Subservice
  ↓
Booking Type
  ↓
Location
  ↓
Price Confirmation
  ↓
Booking
  ↓
Worker Matching
  ↓
Worker Assigned
  ↓
Travelling
  ↓
Arrived
  ↓
Doorstep OTP
  ↓
In Progress
  ↓
Completed
  ↓
Payment
  ↓
Invoice
  ↓
Rating
```

---

## 9. Customer Home

Show:

- greeting
- current location
- language selector
- service categories
- current booking if any
- emergency help
- popular services
- recent bookings

Do not overcrowd the home screen. Prioritize:

1. Find a service
2. Emergency help
3. Current booking
4. Popular services

---

## 10. Customer Service Selection

First show the 10 main service categories:

```
Plumbing
Electrical
Carpentry
Painting
Domestic Help
Caregiving
Driving
Gardening
Cleaning
Technician
```

After selecting a category, show its subservices. Example — PLUMBING:

```
Pipe leakage
Tap repair
Drain blockage
Bathroom fitting
Pipe burst
```

The UI must make the hierarchy visually obvious.

---

## 11. Customer Location

Create a professional location selection experience. The map should feel comparable to a polished production consumer service application.

Requirements:

- clean map rendering
- clear current-location marker
- clear selected service location marker
- readable streets
- appropriate zoom level
- subtle map controls
- location search
- current-location action
- address confirmation
- selected address summary
- responsive behavior
- no cluttered unnecessary map controls

Do not describe or expose the underlying map provider in the UI. The implementation should use a production-capable mapping solution that can later be configured for the actual deployment environment.

The frontend should represent:

- latitude
- longitude
- formattedAddress

The backend will eventually store the coordinates as PostGIS geographic coordinates. Do NOT implement PostGIS in the frontend.

---

## 12. Booking Confirmation

Show:

- category
- selected subservice
- booking type
- location
- date/time if scheduled
- fixed service price
- worker wage-floor amount
- confirmation button

Keep the pricing transparent. Do not show unnecessary platform fees. Do not invent taxes or charges.

---

## 13. Customer Matching

The customer does NOT manually browse or negotiate with workers. The system automatically matches an eligible worker.

**Standard / On-Demand** — eligible worker selection is based on:

- verified required skill
- active verification
- availability
- location proximity
- workload balancing

The frontend should only display the result and an understandable allocation explanation where appropriate.

Do NOT call this AI. The standard matching logic is an explainable deterministic allocation process.

---

## 14. Emergency Matching

Emergency bookings use a priority broadcast model.

Eligible workers:

- verified
- required skill
- active
- available
- within the configured emergency service radius

The system sends the emergency job to multiple eligible workers. The first worker to accept receives the job.

The frontend must simulate this behavior. Do NOT implement distributed locking in React. The backend will eventually enforce atomic acceptance.

For the prototype: Worker A, Worker B, Worker C may receive the same emergency request.

When Worker B accepts:

- Worker A: "Job accepted by another worker."
- Worker C: "Job accepted by another worker."
- Worker B: "Emergency job accepted."

---

## 15. Emergency Fallback

If no worker accepts an emergency request, customer sees:

> "No emergency workers available nearby."

Options:

- Try Again
- Expand Search
- Book as On-Demand

Federation sees the request under "Unfulfilled Emergencies." Federation can manually dispatch/contact a worker. The intervention should be recorded in mock data.

Do NOT create an emergency timeout configuration screen. For the prototype, use a sensible fixed countdown internally. It does not need to be configurable.

---

## 16. Job Status

**Standard and On-Demand:**

```
SEARCHING → OFFERED → ACCEPTED → TRAVELLING → ARRIVED → IN_PROGRESS → COMPLETED
```

**Emergency:**

```
SEARCHING → BROADCAST → ACCEPTED → TRAVELLING → ARRIVED → IN_PROGRESS → COMPLETED
```

**Supporting:** CANCELLED, EXPIRED

Use visual progress indicators. Make the current state obvious.

---

## 17. Doorstep Mutual OTP

When the worker reaches ARRIVED, generate a 6-digit OTP.

The customer sees:

> "Share this OTP with the worker at your doorstep."

Worker enters the OTP.

- **Correct OTP:** ARRIVED → IN_PROGRESS
- **Incorrect OTP:** Show an error.

The OTP is a prototype physical-presence verification mechanism. Do not describe it as government authentication.

---

## 18. Worker Registration

Fields:

- Name
- Phone
- Registered Society
- Membership ID
- Skills
- Certifications
- e-Shram UAN

Initial state: `PENDING_VERIFICATION`

Federation verifies the worker. Approved: `ACTIVE`

Worker must have verified required skill, ACTIVE status, and availability before receiving jobs.

---

## 19. Worker Dashboard

Show:

- Online / Offline status
- Today's jobs
- Current job
- Today's earnings
- Completed jobs
- Welfare balance
- PMSBY status
- PMJJBY status

Use large touch-friendly controls. The worker UI should prioritize clarity over information density.

---

## 20. Worker Job Card

Show:

- service category
- subservice
- booking type
- approximate distance
- customer area
- scheduled time
- guaranteed earning
- status

For emergency jobs:

- clear Emergency badge
- prominent alert
- acceptance action

Do not display an emergency premium because there is no emergency surcharge.

---

## 21. Worker Earnings

Show:

- Today's earnings
- Weekly earnings
- Completed jobs
- Base earnings
- Welfare contributions

Keep financial information simple. Do not create a complicated accounting system for the prototype.

---

## 22. Worker Welfare

Show:

- welfare balance
- contribution history
- PMSBY enrollment/status
- PMJJBY enrollment/status

Clearly label these as prototype status/tracking where appropriate. Do not claim actual government insurance enrollment unless the real integration exists.

---

## 23. Customer Payment

For the prototype, payment can be simulated. The customer pays the fixed subservice price.

**Example — Pipe leakage:**

- Price: ₹500
- Worker wage floor: ₹500
- Worker earning: ₹500

The payment flow should look realistic but must not falsely claim real payment settlement.

---

## 24. Digital Invoice

Invoice should contain:

- invoice number
- service category
- subservice
- customer
- worker
- society registration number
- worker e-Shram reference
- service price
- worker earning
- payment status
- date/time

Create a professional printable/downloadable invoice interface.

---

## 25. Customer Rating

After completion: 1–5 stars, optional feedback.

Rating is associated with the completed job and worker. The rating may later influence worker matching.

---

## 26. Federation Admin Dashboard

Create a professional institutional operations dashboard. Main sections:

- Overview
- Workers
- Verification
- Societies
- Jobs
- Emergency Dispatch
- Allocation
- Welfare
- Demand Forecast
- Configuration

---

## 27. Federation Overview

Metric cards:

- Active Workers
- Jobs Today
- Available Workers
- Welfare Balance

Additional sections:

- active jobs
- recent completed jobs
- emergency requests
- worker verification queue
- demand forecast summary

---

## 28. Worker Verification

Show:

- worker name
- society
- membership ID
- skills
- certifications
- e-Shram reference
- verification status

Actions: Approve, Reject, View Details

Approved worker becomes ACTIVE in mock state.

---

## 29. Society Management

There is NO separate Society dashboard. Federation can:

- filter workers by society
- inspect workforce distribution
- inspect jobs by society
- view society-level workforce statistics

---

## 30. Federation Job Management

Show:

- job ID
- service category
- subservice
- booking type
- customer area
- assigned worker
- society
- job status
- service price

Open a detailed job view.

---

## 31. Allocation Inspection

For standard jobs, Federation can inspect why a worker was selected. Show readable factors such as:

- proximity
- worker rating
- workload
- required verified skill
- availability

Show a clear explanation of the selected worker, e.g.:

> "Worker selected because they have the required verified skill, are available, and are among the closest eligible workers while maintaining workload balance."

Do NOT create configurable W1/W2/W3 controls. Do NOT expose allocation weights as admin configuration. The prototype should use a sensible fixed allocation policy internally. Do not present arbitrary mathematical configuration to the judges unless required.

---

## 32. Emergency Admin View

Create "Unfulfilled Emergencies." Show:

- emergency ID
- category
- subservice
- location
- created time
- nearby eligible worker count
- dispatch status

Action: Manual Dispatch

After dispatch: worker, dispatch method, timestamp, status

---

## 33. Welfare Admin

Show:

- total welfare contributions
- worker welfare balances
- contribution history
- aggregate welfare view

Keep it operational and understandable.

---

## 34. Demand Forecast

The team already has an ML demand forecasting model. Do NOT create another ML model. Initially use realistic mock forecast data.

Display: Service Category, Subservice (where useful), Area, Forecast Demand, Available Capacity, Capacity Gap, Recommendation

**Example:**

- Plumbing → High demand → Medium capacity → Gap
- Electrical → Medium demand → High capacity → Optimal
- Cleaning → High demand → Low capacity → Gap

The UI should communicate that this information comes from the existing ML model. Later the backend will provide actual model results.

---

## 35. Federation Configuration

Configuration should be intentionally small. Allow Federation to configure:

- fixed price per subservice
- welfare contribution rule if required by the prototype

Do NOT include:

- W1
- W2
- W3
- emergency timeout
- emergency surcharge
- dynamic pricing
- surge pricing
- arbitrary platform fees

Emergency booking uses the same fixed service price as the corresponding normal booking. The configuration screen should remain simple.

---

## 36. Multilingual Support

Support exactly: **English, Hindi, Tamil**

Language selector should be available:

- during initial application entry
- in profile/settings

Use translation keys throughout the application. Do not hardcode English text directly inside components when it should be translatable. Ensure Hindi and Tamil have enough line-height and space so text never clips.

---

## 37. Domain Types

Create TypeScript interfaces for:

- Federation
- Society
- User
- CustomerProfile
- WorkerProfile
- WorkerSkill
- ServiceCategory
- Subservice
- Job
- Payment
- Invoice
- WelfareLedger
- InsuranceStatus
- Rating
- DemandForecast
- AllocationDetails

Do not mix UI-specific types with backend domain models unnecessarily.

---

## 38. Mock Data

Create realistic mock data for:

- one federation
- several societies
- 15–30 workers
- multiple worker skills
- several customers
- all 10 service categories
- all important subservices
- active jobs
- completed jobs
- emergency jobs
- payments
- invoices
- welfare records
- ratings
- demand forecasts

Use realistic Indian names, locations and ₹ values. Do not create thousands of fake records.

---

## 39. Authentication

Create prototype role-based login. Allow testing as: Customer, Worker, Federation Admin.

Use simulated authentication initially. Structure the code so JWT authentication from Spring Boot can be connected later. Do not spread authentication logic across individual screens.

---

## 40. Error / Loading States

Every API-like operation should have: Loading, Success, Empty, Error.

Examples:

- "No available workers nearby."
- "No emergency workers accepted the request."
- "No bookings found."
- "Worker verification pending."
- "Unable to load service information."

---

## 41. Responsive Behavior

**Customer and Worker:** Mobile-first. At larger widths, convert the mobile navigation into a clean desktop sidebar/navigation system.

**Federation:** Desktop-first.

- ~240px sidebar
- ~60px top header
- Keep content inside a reasonable maximum width
- Never allow huge empty full-width layouts on ultra-wide screens

---

## 42. Map Experience

The map must NOT look like a generic developer/demo map. It should feel appropriate for a real production service application.

The visual experience should include:

- polished map styling
- readable roads and locality information
- clear location markers
- clean worker/service markers
- sensible zoom
- selected location emphasis
- current location indication
- minimal controls
- clustering where multiple workers appear
- responsive behavior
- clear relationship between map and selected service/job

For Federation: show worker/service/job clusters at an operational level. Do not overload the map with dozens of visual elements.

The map provider/implementation should remain replaceable through a dedicated map component so the production provider can be configured later.

---

## 43. Code Organization

Use a clean architecture. Suggested:

```
src/
  components/
    ui/
    shared/
    customer/
    worker/
    federation/
  pages/
    customer/
    worker/
    federation/
  services/
  hooks/
  types/
  mock/
  store/
  i18n/
  lib/
  layouts/
```

Do not create giant page files. Break complex pages into meaningful components. Avoid duplicate implementations of the same component.

---

## 44. Important Demo Flow

The following flow must work completely using mock data:

**WORKER**
Register → Society → Skills → e-Shram → Verification → Active → Available

**CUSTOMER**
Language → Service Category → Subservice → Standard / On-Demand / Emergency → Location → Confirmation

**MATCHING**
→ Eligible Worker → Standard allocation OR Emergency broadcast

**WORKER**
→ Accept → Travelling → Arrived

**CUSTOMER**
→ OTP displayed

**WORKER**
→ OTP entered → In Progress → Complete

**PAYMENT**
→ Fixed Service Price → Payment simulation → Invoice

**CUSTOMER**
→ Rating

**FEDERATION**
→ View Worker → View Job → View Allocation → View Emergency → View Welfare → View Demand Forecast

This complete end-to-end lifecycle is more important than creating dozens of disconnected screens.

---

## 45. Things Intentionally Out of Scope

Do NOT add:

- separate Society application
- Society dashboard
- AI chatbot
- customer-worker chat
- continuous GPS breadcrumb tracking
- real government KYC
- real insurance underwriting
- real government API integration
- real payment settlement
- dynamic pricing
- surge pricing
- emergency surcharge
- configurable emergency timeout
- W1/W2/W3 configuration
- complex dispute management
- training academy
- worker-to-customer reverse rating
- unnecessary command-center features
- invented features not supported by the problem statement

Keep the prototype focused.

---

## 46. Most Important Development Principle

Do NOT attempt to generate the entire application in one giant implementation. Build incrementally.

**First:**

1. Project architecture
2. Routing
3. Design system
4. Domain types
5. Mock data
6. Mock API/service layer
7. Authentication
8. i18n
9. Shared components

**Then:**

10. Complete Customer vertical slice

**Then:**

11. Complete Worker vertical slice

**Then:**

12. Federation dashboard

**Then:**

13. Connect the shared mock job lifecycle across Customer + Worker + Federation

**Finally:**

14. Prepare the service layer for Spring Boot integration.

---

## 47. Visual Style & Frontend Design Specification

The following visual specification is provided as design inspiration and direction, **NOT** as something that must be copied exactly. Use it to understand the desired visual language, spacing, color relationships, hierarchy and level of polish.

- Do NOT reproduce the reference literally.
- Do NOT copy the exact layouts.
- Do NOT copy branding.
- Do NOT use the "CG" branding shown in the reference.

Adapt the principles into a professional React application appropriate for this problem statement.

### Design Persona

**Character:** Democratic, Institutional, Modern, High-clarity, Trustworthy, Welcoming, Accessible

**Visual style:** Flat and crisp modernism, minimal visual noise, near-zero heavy shadows, structural depth through subtle borders, strong hierarchy, professional information density.

The product should feel like a serious digital public/cooperative service rather than a generic SaaS landing page.

---

## 48. Color Direction

### Customer and Worker

- Primary: `#F2B705` — primary CTA, active icons, important actions, brand accent
- Primary dark: `#D99A00`
- Institutional dark: `#0F172A`
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Secondary surface: `#F1F5F9`
- Border: `#E2E8F0`
- Primary text: `#0F172A`
- Secondary text: `#64748B`
- Success: `#16A34A`
- Warning: `#D97706`
- Error / Emergency: `#DC2626`

### Federation Admin

- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Primary: `#2563EB`
- Primary hover: `#1D4ED8`
- Primary tint: `#EFF6FF`
- Dark ink: `#0F172A`
- Border: `#E2E8F0`
- Strong border: `#CBD5E1`

---

## 49. Typography

Use a modern clean sans-serif: Inter, -apple-system, BlinkMacSystemFont, Roboto, Segoe UI

- Screen titles: 800–900 weight, 22–28px
- Section headings: 700 weight, 16–18px
- Card titles: 600 weight, 14–15px
- Body: 400 weight, 14px, ~1.5 line height
- Secondary: 500 weight, 12–13px

Use tabular/monospace figures for: ₹ currency, OTP digits, ratings, phone numbers, dates, dashboard metrics.

Ensure sufficient line-height for Hindi and Tamil.

---

## 50. Component Style

**Cards:** white surface, 1px `#E2E8F0` border, 12px radius on mobile, 8px radius on admin, extremely subtle shadow only when necessary, 14–20px internal padding

**Primary customer/worker buttons:** gold, dark text, 44–48px height, bold, 10px radius

**Primary admin buttons:** blue, white text, 44–48px height, 6px radius

**Secondary buttons:** white/transparent, thin border, dark text

**Inputs:** white, 1px border, clear focus state, 10px radius, comfortable touch area

---

## 51. Status Badges

Use pill-shaped status badges with: light tinted background + solid status dot + bold text

- **Available:** light green background, green dot, green text
- **Travelling / In Progress:** light amber background, amber indicator, amber text
- **Offline / Cancelled:** light slate background, slate indicator, slate text
- **Emergency:** light red background, red indicator, red text

Do not use rainbow-colored status systems.

---

## 52. Layout

**Customer/Worker mobile:** clean top app bar, location context, language selector, service discovery, bottom navigation where appropriate

At larger widths: convert mobile navigation to a clean fixed sidebar, keep primary content centered, use a maximum content width around 1060–1200px

**Federation:** ~240px sidebar, ~60px header, responsive metric grid, clean tables, compact but readable data density

---

## 53. Do

- 1px `#E2E8F0` borders
- `#F8FAFC` scaffold background
- white cards
- strong typography hierarchy
- consistent spacing
- tabular numbers
- accessible touch targets
- subtle hover/focus feedback
- clean icons
- production-quality empty/loading/error states

---

## 54. Do Not

- heavy blurry shadows
- excessive gradients
- rainbow badges
- inconsistent corner radiuses
- excessive glassmorphism
- excessive animations
- giant hero sections inside the actual application
- generic template-looking dashboard layouts
- fake startup branding
- "CoopGig"
- "CG"
- invented product names

The final application must visually and verbally feel like a professional implementation of **Problem Statement 26089 — Cooperative Gig Services Platform for Household & Community Services**.

The visual reference above is inspiration only. Adapt it intelligently rather than reproducing it literally.
