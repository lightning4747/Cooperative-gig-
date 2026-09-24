# API contract — implemented backend

Base path: `/api/v1`. The [runtime-derived OpenAPI snapshot](api/openapi.json) supplies request schemas; [Swagger UI](http://localhost:8080/docs/api) explores a running local instance. This guide adds ownership, lifecycle and response rules that generated schemas do not fully express. The [interactive reference](index.html#api) filters all 49 operations by role.

## Wire conventions

| Concern | Contract |
|---|---|
| Authentication | `Authorization: Bearer <accessToken>` except public routes. Role checks and resource ownership both apply |
| Request | JSON with camelCase properties; unknown JSON properties rejected; UUID strings for IDs |
| Success | **200** for current operations, including creates. `Empty` means zero response body; do not call `response.json()` on it |
| Errors | `application/problem+json`; HTTP status, machine `code`, readable `detail`, `requestId`; validation may add `errors` |
| Correlation | Server-generated `X-Request-Id`; retain requestId for support; API responses use `Cache-Control: no-store` |
| Money | Decimal JSON numbers in INR, amounts to two fractional digits; server calculation is authoritative. Some raw payment/list rows omit currency: INR is the only supported currency |
| Time | ISO-8601 timestamps; send an offset or Z. Display in user locale; persisted times are instants. Analytics day boundary follows DB timezone |
| Location | Latitude −90..90, longitude −180..180, distance/radius in meters. Latest GPS is stale at 15 minutes |
| Lists | Plain arrays, **no total/page envelope**. Jobs use `page=0&size=25` (max 100); admin workers/unfulfilled/welfare use `page=0` with fixed 100 |
| Event/audit cursors | `after=0` initially; preserve last returned numeric id, drain 100-item batches, then poll. Empty batch means no new records |
| Nulls | Assignment, location and time fields may be null before their lifecycle step; do not render missing values as zero |

## Complete operation inventory

`Owner` means the customer who created the job; `assigned` means its selected worker. Admin job read permission **does not** grant doorstep-code access. Paths below include the base path. Query/header parameters are listed alongside the request schema.

| Method / route | Caller | Request / parameters | Success | Rules |
|---|---|---|---|---|
| `GET /api/v1/admin/analytics/historical` | Admin | —; query: days (default 30) | Historical analytics | 30-day time series trends, category metrics, revenue, welfare funds, and capacity breakdown from PostgreSQL facts. |
| `GET /api/v1/admin/audit` | Admin | —; query: after | Audit entry[] | After cursor; ordered, up to 100. |
| `GET /api/v1/admin/config` | Admin | — | Configuration | Current allocation/pricing configuration and optimistic version. |
| `PUT /api/v1/admin/config` | Admin | [Config](#config) | Configuration | Version must match; three allocation weights sum to 1; snapshots of existing jobs remain unchanged. |
| `POST /api/v1/admin/forecast` | Admin | [ForecastRequest](#forecastrequest) | Forecast | Horizon 1–30 days; deterministic mock model ingestion fallback from real PostgreSQL capacity/demand when external model URL is unconfigured. |
| `GET /api/v1/admin/jobs/{id}/allocation` | Admin | — | Allocation audit | Current offers, manualDispatch and history; earlier retry offers are in audit archive. |
| `GET /api/v1/admin/jobs/{id}/eligible-workers` | Admin | — | Candidate[] | Current eligible workers, contact and distance/load data; eligibility checked again when assigning. |
| `POST /api/v1/admin/jobs/{id}/manual-dispatch` | Admin | [Manual](#manual) | Job | EXPIRED → ACCEPTED; eligible worker only; method/note retained in audit. |
| `GET /api/v1/admin/metrics` | Admin | —; query: societyId | Metrics | Optional societyId; online can include busy workers; available excludes busy. |
| `PUT /api/v1/admin/subservices/{id}/price` | Admin | [Price](#price) | Empty | Set basePrice, emergencySupported and active explicitly; old quotes retain price. |
| `GET /api/v1/admin/unfulfilled` | Admin | —; query: page | Unfulfilled job[] | EXPIRED jobs; page of 100. |
| `GET /api/v1/admin/welfare` | Admin | —; query: societyId, query: page | Welfare entry[] | Optional societyId; page of 100; contribution ledger, not benefit disbursement. |
| `GET /api/v1/admin/workers` | Admin | —; query: societyId, query: status, query: page | Worker summary[] | Optional societyId/status; page of 100. No full UAN. |
| `PUT /api/v1/admin/workers/{id}/insurance` | Admin | [Insurance](#insurance) | Empty | Record manual enrollment state and audit evidence reference. |
| `PUT /api/v1/admin/workers/{id}/verification` | Admin | [Verification](#verification) | Empty | ACTIVE/REJECTED/SUSPENDED; verify declared skills only; ACTIVE requires at least one. |
| `POST /api/v1/auth/challenges` | Public | [Challenge](#challenge) | Challenge | Development challenge; 5 min expiry, max 5 requests/phone/10 min. Production delivery absent (503). |
| `POST /api/v1/auth/refresh` | Public | [Refresh](#refresh) | Session | Rotate refresh token; reuse revokes the whole session family. |
| `POST /api/v1/auth/verify` | Public | [Verify](#verify) | Session | Verify 6 digits; max 5 wrong attempts. Existing account keeps its role. |
| `GET /api/v1/catalog/categories` | Public | — | Category[] | Service categories; use returned UUIDs. |
| `GET /api/v1/catalog/subservices` | Public | —; query: categoryId | Subservice[] | Active subservices; optional categoryId filter; INR prices. |
| `GET /api/v1/events` | Authenticated | —; query: after | Event[] | Own durable events after cursor; ordered, up to 100. |
| `GET /api/v1/jobs` | Owner / assigned / admin | —; query: page, query: size, query: societyId | Job summary[] | Own customer jobs, assigned worker jobs, or all admin jobs; page/size; societyId effective only for admin. |
| `POST /api/v1/jobs` | Customer | [CreateJob](#createjob); header: Idempotency-Key (required) | Job | Requires Idempotency-Key; consumes one valid quote owned by caller; dispatch may change state immediately. |
| `GET /api/v1/jobs/{id}` | Owner / assigned / admin | — | Job | Authoritative lifecycle, worker, financial snapshot and history; never includes doorstep code. |
| `POST /api/v1/jobs/{id}/accept` | Worker | — | Job | Pending valid offer and current eligibility required; first acceptance wins. Same assigned worker may replay. |
| `POST /api/v1/jobs/{id}/arrive` | Assigned worker | — | Job | TRAVELLING → ARRIVED; issues customer-only code for 10 minutes. |
| `POST /api/v1/jobs/{id}/cancel` | Customer owner / admin | [Cancel](#cancel) | Job | Allowed before IN_PROGRESS, including EXPIRED; clears pending offers and code. |
| `POST /api/v1/jobs/{id}/complete` | Assigned worker | — | Job | IN_PROGRESS → COMPLETED; payment is separate. |
| `POST /api/v1/jobs/{id}/decline` | Worker | — | Empty | Decline pending offer; advance sequential dispatch or expire exhausted broadcast. |
| `GET /api/v1/jobs/{id}/doorstep-code` | Customer owner | — | Doorstep code | ARRIVED only; otp, expiresAt, attemptsRemaining. Do not log or cache. |
| `POST /api/v1/jobs/{id}/doorstep-code/renew` | Customer owner | — | Doorstep code | ARRIVED only, after expiry; resets attempts and returns replacement. |
| `GET /api/v1/jobs/{id}/invoice` | Owner / assigned / admin | — | Invoice | Immutable demonstration receipt JSON; 404 before payment; no PDF or assessed tax. |
| `GET /api/v1/jobs/{id}/payment` | Owner / assigned / admin | — | Payment | 404 until recorded payment exists. |
| `POST /api/v1/jobs/{id}/payments/simulate` | Customer owner | — | Payment | COMPLETED only; development sandbox required; repeated calls return the existing payment. |
| `POST /api/v1/jobs/{id}/rating` | Customer owner | [Rating](#rating) | Empty | COMPLETED only; once per job; updates worker all-time average. |
| `POST /api/v1/jobs/{id}/retry` | Customer owner / admin | [Retry](#retry) | Job | EXPIRED only, maximum 3 retries; radius 100–20,000 m; optional emergency → on-demand fallback preserves price. |
| `POST /api/v1/jobs/{id}/start` | Assigned worker | [Start](#start) | Job | ARRIVED → IN_PROGRESS with valid code; max 5 wrong attempts persist. |
| `GET /api/v1/jobs/{id}/tracking` | Owner / assigned / admin | — | Tracking | Only ACCEPTED/TRAVELLING/ARRIVED/IN_PROGRESS; includes freshness, no route or ETA. |
| `POST /api/v1/jobs/{id}/travel` | Assigned worker | — | Job | ACCEPTED → TRAVELLING. |
| `GET /api/v1/me` | Authenticated | — | User | Current account id, phone, role, name and preferredLang. |
| `PATCH /api/v1/me` | Authenticated | [Profile](#profile) | User | Replace name and language preference. |
| `POST /api/v1/me/logout` | Authenticated | — | Empty | Revoke current session family, including access tokens. |
| `POST /api/v1/quotes` | Customer | [QuoteRequest](#quoterequest) | Quote | Five-minute immutable financial snapshot; emergency must be supported by subservice. |
| `GET /api/v1/societies` | Public | — | Society[] | Reference societies for onboarding and administrative filters. |
| `GET /api/v1/workers/me` | Worker | — | Worker profile | 404 before onboarding. Masked UAN, verification, skills, insurance, availability and GPS. |
| `PATCH /api/v1/workers/me/availability` | Worker | [Availability](#availability) | Worker profile | Only ACTIVE workers may change availability; fresh GPS is additionally required for dispatch. |
| `GET /api/v1/workers/me/earnings` | Worker | — | Earnings | Recorded simulated totals and latest 100 payments; not a real payout statement. |
| `PUT /api/v1/workers/me/location` | Worker | [Location](#location) | Empty | Save latest coordinates and server timestamp. |
| `GET /api/v1/workers/me/offers` | Worker | — | Offer[] | Unexpired pending offers with area, price split and distance; no doorstep code or exact address. |
| `POST /api/v1/workers/me/onboarding` | Worker | [Onboard](#onboard) | Worker profile | Create once; UAN encrypted, skills await manual verification. |

## Development walkthrough

Start the backend using the [README](../README.md). The following shell example needs `curl`, `jq` and `uuidgen`. It logs in a local customer, reads a live catalog item, obtains an on-demand quote and creates a job. A job can immediately become `EXPIRED` when no verified, online worker with fresh GPS is eligible; that is a valid result.

```sh
API=http://localhost:8080/api/v1
CHALLENGE=$(curl --fail-with-body -sS "$API/auth/challenges" \
  -H 'Content-Type: application/json' -d '{"phone":"+919876543210"}')
VERIFY=$(jq -n --arg id "$(printf '%s' "$CHALLENGE" | jq -r .challengeId)" \
  --arg code "$(printf '%s' "$CHALLENGE" | jq -r .devCode)" \
  '{challengeId:$id,code:$code,role:"CUSTOMER",name:"Demo Customer"}')
SESSION=$(curl --fail-with-body -sS "$API/auth/verify" \
  -H 'Content-Type: application/json' -d "$VERIFY")
TOKEN=$(printf '%s' "$SESSION" | jq -r .accessToken)
SERVICE=$(curl --fail-with-body -sS "$API/catalog/subservices" | jq -r '.[0].id')
QUOTE=$(curl --fail-with-body -sS "$API/quotes" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$(jq -n --arg id "$SERVICE" '{subserviceId:$id,bookingType:"ON_DEMAND"}')")
BODY=$(jq -n --arg id "$(printf '%s' "$QUOTE" | jq -r .id)" \
  '{quoteId:$id,latitude:11.0183,longitude:76.9644,formattedAddress:"10 Cross Cut Road, Gandhipuram, Coimbatore",area:"Coimbatore"}')
KEY=$(uuidgen)
curl --fail-with-body -sS "$API/jobs" -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $KEY" -H 'Content-Type: application/json' -d "$BODY"
```

Preserve `KEY` and `BODY` across an uncertain network retry. The same customer/key/body returns the job's **current** representation, even after the quote expires; a changed body returns 409. One quote cannot create multiple jobs. Request a fresh quote for a new booking intent.

For a worker, use a different phone and role `WORKER`, then onboarding → admin verification → GPS update → available=true. The bootstrap administrator logs in with its configured phone; submit role `CUSTOMER` to verification and route by the returned **ADMIN** role. Public registration never grants admin rights.

## Lifecycle and response examples

```mermaid
sequenceDiagram
  participant C as Customer
  participant B as Backend
  participant W as Worker
  C->>B: POST /quotes → POST /jobs (idempotency key)
  B-->>W: JOB_OFFER event + GET /workers/me/offers
  W->>B: POST /accept → /travel → /arrive
  C->>B: GET /doorstep-code
  B-->>C: otp + expiresAt + attemptsRemaining
  C-->>W: Share code at doorstep
  W->>B: POST /start {otp} → /complete
  C->>B: POST /payments/simulate
  B-->>C: SIMULATED_SUCCEEDED
  C->>B: GET /invoice; POST /rating
```

### Job view

Representative shape below uses placeholder IDs and illustrative timestamps. Unassigned worker fields are null. A job can be SEARCHING, OFFERED, BROADCAST, ACCEPTED, TRAVELLING, ARRIVED, IN_PROGRESS, COMPLETED, EXPIRED or CANCELLED. Payment is a separate record, not a job state.

```json
{
  "id":"<job UUID>", "customerId":"<customer UUID>", "workerId":null,
  "subserviceId":"<service UUID>", "serviceName":"Pipe burst",
  "bookingType":"EMERGENCY", "status":"BROADCAST",
  "area":"Coimbatore", "formattedAddress":"Customer-selected address",
  "latitude":11.0183, "longitude":76.9644, "scheduledTime":null,
  "createdAt":"2026-09-19T09:00:00Z", "updatedAt":"2026-09-19T09:00:00Z",
  "completedAt":null, "offerDeadline":"2026-09-19T09:01:00Z",
  "dispatchRadiusM":5000, "basePrice":500.00, "grossAmount":500.00,
  "welfareRate":0.500, "configVersion":1, "allocationScore":null,
  "allocationBreakdown":null, "retryCount":0, "workerName":null,
  "workerRating":null, "societyName":null, "currency":"INR",
  "history":[{"fromStatus":null,"toStatus":"SEARCHING","reason":"Booking created","createdAt":"2026-09-19T09:00:00Z"}]
}
```

History contains all transitions; the example abbreviates it. Emergency accepted allocations use a broadcast explanation without a weighted score. Standard/on-demand weighted allocation is documented in [architecture](architecture.md).

### Payment and receipt

```json
{
  "id":"<payment UUID>", "jobId":"<job UUID>", "status":"SIMULATED_SUCCEEDED",
  "basePrice":500.00, "grossAmount":500.00, "surplus":0.00,
  "welfareContribution":0.00, "workerEarning":500.00, "platformFee":0.00,
  "createdAt":"2026-09-19T10:00:00Z"
}
```

Invoice result is `{id, jobId, invoiceNumber, snapshot, createdAt}`. Its immutable snapshot contains workerName, uanLast4, societyName, societyRegistration, serviceName, customerName, jobId, paymentId, currency, baseWage, grossAmount, surplus, welfareContribution, workerEarning, platformFee, taxStatus, paymentStatus and documentType. Labels are `NOT_ASSESSED`, `SIMULATED_SUCCEEDED`, and `DEMONSTRATION_RECEIPT`; keep them visible in the frontend.

### Event processing

Events contain `id`, `type`, `jobId` (nullable), and `createdAt`. Current types include `JOB_OFFER`, `OFFER_CLOSED`, `VERIFICATION_UPDATED`, `DISPATCH_REQUIRED`, and `JOB_<new status>` lifecycle notifications. Treat events as invalidation hints: refetch offers/job/profile. Not every expired/cancelled offer emits OFFER_CLOSED, so also reconcile on deadlines and resume. These are polling records, not WebSockets or mobile push.

## Error and concurrency handling

| HTTP | Meaning | Client action |
|---|---|---|
| 400 | Validation, malformed JSON, unsupported combination, incorrect OTP | Correct input; show field errors where present; do not blindly retry |
| 401 | Invalid login code (`INVALID_CODE`), expired challenge (`CHALLENGE_EXPIRED`), or missing/expired/revoked session | Login failures stay in the login flow. For protected requests, single-flight refresh then bounded safe replay; otherwise login |
| 403 | Role not allowed | Deny action; do not retry |
| 404 | Missing or ownership-hidden resource | Show unavailable; never infer existence |
| 409 | State/offer race, quote expiry, used quote, duplicate rating, stale config, exhausted code | Refetch authoritative state; explain recovery |
| 429 | Phone challenge throttling | Respect Retry-After; additional rolling-window limit may still apply |
| 503 | SMS, payment or forecast unavailable | Show unavailable; no fabricated success |

```json
{
  "type":"urn:cooperative:error:conflict", "title":"Conflict", "status":409,
  "detail":"Configuration changed; reload before saving",
  "code":"CONFLICT", "requestId":"<request UUID>"
}
```

`instance` may also be present. Human `detail` is not a stable programmatic enum. A valid-code start clears stored OTP; a wrong-code attempt remains recorded even though the request fails. After 5 wrong attempts, wait for expiry and let the customer renew. Refresh tokens are single-use with a 30-day expiry on each newly rotated token (a sliding expiry, not an absolute session horizon); reuse revokes the family, so coordinate refresh across requests/tabs. Access tokens last 15 minutes and session revocation is checked on requests.

Do not apply automatic retries to every write. Booking and simulated payment have explicit replay behavior; most lifecycle writes will conflict after the first success. Refetch before repeating an uncertain lifecycle action. An administrator must GET config, submit its current `version` and all configuration fields, then reconcile 409 instead of overwriting newer changes.

## Request schema reference

Generated from the checked runtime OpenAPI. Server validation adds constraints not fully represented by generated schemas:

- Names, address/area, membershipId, notes/reasons/method, refreshToken and individual certification descriptions must be **nonblank**.
- categoryIds requires **1–10** distinct UUIDs; certifications is required and may be empty.
- STANDARD requires scheduledTime **15 minutes–90 days ahead**; ON_DEMAND and EMERGENCY forbid it.
- Config requires a positive version, explicit radius/timeout values, allocation weights summing to 1. Weights/welfareRate permit at most 3 decimal places; money permits at most 2 (max 8 integer digits).
- Send primitive boolean fields explicitly, including false: an omitted boolean currently becomes false. Send numeric fields explicitly: omitted primitive numbers default to zero and fail their positive minimum.
- All methods with a request schema require a JSON body. PATCH /me replaces both listed profile fields; it is not a partial JSON merge.

### Location

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `latitude` | number (double) | Yes | minimum=-90; maximum=90 |
| `longitude` | number (double) | Yes | minimum=-180; maximum=180 |

### Verification

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `status` | string | Yes | pattern=ACTIVE / REJECTED / SUSPENDED |
| `verifiedCategoryIds` | array of uuid | Yes | uniqueItems=True |
| `note` | string | Yes | minLength=0; maxLength=1000 |

### Insurance

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `pmsbyStatus` | string | Yes | pattern=NOT_ENROLLED / PENDING / ENROLLED |
| `pmjjbyStatus` | string | Yes | pattern=NOT_ENROLLED / PENDING / ENROLLED |
| `evidenceReference` | string | Yes | minLength=0; maxLength=1000 |

### Price

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `basePrice` | number | Yes | minimum=0.01 |
| `emergencySupported` | boolean | See rules above | — |
| `active` | boolean | See rules above | — |

### Config

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `version` | integer (int32) | See rules above | minimum=1 |
| `proximityWeight` | number | Yes | minimum=0; maximum=1 |
| `ratingWeight` | number | Yes | minimum=0; maximum=1 |
| `loadWeight` | number | Yes | minimum=0; maximum=1 |
| `welfareRate` | number | Yes | minimum=0; maximum=1 |
| `emergencySurcharge` | number | Yes | minimum=0 |
| `standardRadiusM` | integer (int32) | See rules above | minimum=100; maximum=50000 |
| `emergencyRadiusM` | integer (int32) | See rules above | minimum=100; maximum=20000 |
| `emergencyTimeoutS` | integer (int32) | See rules above | minimum=60; maximum=90 |

### Onboard

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `societyId` | string (uuid) | Yes | — |
| `membershipId` | string | Yes | minLength=0; maxLength=80 |
| `uan` | string | Yes | pattern=[0-9]{12} |
| `categoryIds` | array of uuid | Yes | minItems=0; maxItems=10; uniqueItems=True |
| `certifications` | array of string | Yes | minItems=0; maxItems=20 |

### QuoteRequest

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `subserviceId` | string (uuid) | Yes | — |
| `bookingType` | string | Yes | pattern=STANDARD / ON_DEMAND / EMERGENCY |

### CreateJob

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `quoteId` | string (uuid) | Yes | — |
| `latitude` | number (double) | Yes | minimum=-90; maximum=90 |
| `longitude` | number (double) | Yes | minimum=-180; maximum=180 |
| `formattedAddress` | string | Yes | minLength=0; maxLength=500 |
| `area` | string | Yes | minLength=0; maxLength=100 |
| `scheduledTime` | string (date-time) | See rules above | — |

### Start

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `otp` | string | Yes | pattern=[0-9]{6} |

### Retry

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `radiusM` | integer (int32) | See rules above | minimum=100; maximum=20000 |
| `fallbackToOnDemand` | boolean | See rules above | — |

### Rating

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `stars` | integer (int32) | See rules above | minimum=1; maximum=5 |
| `feedback` | string | See rules above | minLength=0; maxLength=2000 |

### Cancel

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `reason` | string | Yes | minLength=0; maxLength=1000 |

### Verify

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `challengeId` | string (uuid) | Yes | — |
| `code` | string | Yes | pattern=[0-9]{6} |
| `role` | string | Yes | pattern=CUSTOMER / WORKER |
| `name` | string | Yes | minLength=0; maxLength=100 |

### Refresh

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `refreshToken` | string | Yes | minLength=0; maxLength=200 |

### Challenge

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `phone` | string | Yes | pattern=\+[1-9][0-9]{7,14} |

### Manual

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `workerId` | string (uuid) | Yes | — |
| `method` | string | Yes | minLength=0; maxLength=100 |
| `note` | string | Yes | minLength=0; maxLength=1000 |

### ForecastRequest

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `horizonDays` | integer (int32) | See rules above | minimum=1; maximum=30 |

### Availability

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `available` | boolean | See rules above | — |

### Profile

| Field | Type | Required in OpenAPI | Constraints |
|---|---|---|---|
| `name` | string | Yes | minLength=0; maxLength=100 |
| `preferredLang` | string | Yes | pattern=en / hi / ta |

## Remaining contract work

Most response schemas currently use generic maps; response examples and semantic tables above supplement them. Typed DTO response schemas, generated frontend clients and exhaustive response contract tests remain [G13](gaps.md). Production integrations and their contracts are separately tracked; do not treat development responses as provider settlement or verification evidence.
