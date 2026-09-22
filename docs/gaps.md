# Coverage and gap register

Status vocabulary: **Built** = implemented and locally verified where listed in testing; **Partial** = a usable backend path with a named missing capability; **External** = provider/policy absent; **Frontend** = UI work in the frontend repository. None means production certification.

## Backend specification coverage

| Spec section | State | Evidence / remaining boundary |
|---|---|---|
| 1 Platform and roles | Built | Customer/worker/admin, federation/society reference model; multi-federation isolation absent |
| 2 Core job flow | Built | Booking → dispatch → doorstep authorization → completion → simulation → receipt |
| 3 Three languages | Partial / Frontend | en/hi/ta preference; UI and catalog translations remain |
| 4 Customer experience | Partial / Frontend | Catalog, quotes, booking/history/tracking/cancel/rating APIs; map provider, UI and rating readback remain |
| 5 Worker experience | Partial / Frontend | Onboarding, verification gate, availability, offers, earnings; correction flow and uploads remain |
| 6 Service catalog | Built with demo data | 10 categories and subservices; INR 500/60-minute placeholders require approved values |
| 7 Matching/PostGIS/emergency | Built / Partial delivery | Deterministic sequential allocation, emergency broadcast records, first-accept locking, expiry/manual fallback; true push/audio delivery remains frontend/provider work |
| 8 Lifecycle/OTP | Built | Locked state transitions, customer-only OTP, expiry/attempt limit/renewal; post-start incident handling absent |
| 9 Payment/wage/invoice | Partial | Decimal split, protected base, transactional simulation ledger and JSON receipt; gateway, payout, tax and PDF remain |
| 10 Welfare/e-Shram/security | Partial | Encrypted UAN format/dedup check, manual verification, contribution ledger and insurance status; government validation and claims absent |
| 11 Rating | Partial | Once-per-job rating and all-time average; rolling window and rating readback absent |
| 12 Federation dashboard | Partial / Frontend | Metrics, verification, manual dispatch, allocation audit, welfare/config APIs; UI and reporting refinements remain |
| 13 Forecast and workforce allocation | External / Partial adapter | HTTP boundary and 503 unavailable state; model, area dimension, shortage logic and evaluation absent |
| 14 Data model | Built | Versioned PostgreSQL/PostGIS schema with constraints and indices |
| 15 Technology | Built | Java 21, Spring Boot, JDBC, PostgreSQL, OpenAPI, Docker and CI |
| 16 Prototype vs real | Explicit | Development OTP and payment simulation labeled, production defaults disabled |
| 17 Deliberate exclusions | Preserved | No auction, dynamic surge engine, society app, marketplace chat or unrequested society CRUD |
| 18 Demo flow | Backend tested / Frontend pending | Integration tests exercise complete lifecycle; human UI demo requires frontend wiring |

## Prioritized remaining work

| ID / priority | Gap | Owner | Completion criterion |
|---|---|---|---|
| G01 / P0 launch | Real phone authentication | Backend + SMS provider | Implement delivery adapter, provider failure/retry handling, real OTP verification tests, IP/device/phone abuse controls; no dev code exposure |
| G02 / P0 launch | Live payment, reconciliation and worker payout | Backend + payments/product | Signed webhook validation, provider idempotency, pending/failure/refund states, reconciliation, retry-safe ledger and payout evidence |
| G03 / P0 launch | Deployment security and operational acceptance | Platform + backend | TLS, private DB, secret management/rotation design, least-privilege migration/runtime roles, dependency/security review, backup restore drill, load tests and alerting |
| G04 / P0 launch | Approved reference data and financial/tax policy | Federation + product | Approved prices/durations/registrations, actual receipt requirements, cancellation/refund rules; forward migration replaces all demo data |
| G05 / P0 integration | Frontend application | Frontend team | Handoff acceptance checklist passes with real backend; remove mock success fallbacks |
| G06 / P1 | Rejected onboarding correction and evidence upload | Backend + frontend | Scoped update/resubmit APIs, re-verification, safe upload storage/scan/access controls and audit; duplicate UAN/member protections maintained |
| G07 / P1 | Worker cancellation, reassignment and incidents | Product + backend | Policy and state machine for before/after-start cancellation, suspended worker handling, compensation and dispute trail |
| G08 / P1 | Forecast production contract/model | ML team + backend | Agree payload/response, area/time buckets, capacity and shortage semantics; contract tests, bounded response read, accuracy/drift evaluation |
| G09 / P1 | Push notifications and background delivery | Backend + frontend/platform | Authenticated delivery/reconnect, deduplication, durable retries, consent and measured latency; audible alerts in supported clients |
| G10 / P1 | Scheduled capacity guarantees | Product + backend | Reserve capacity or communicate availability-only scheduling; lateness/no-show/reassignment tests and SLA |
| G11 / P1 | Welfare funding, claims and benefits | Federation + backend | Approved funding source (default surplus is zero), eligibility, claim approvals and auditable disbursement |
| G12 / P1 | Tenant/admin scope | Backend + federation | Decide single federation versus multiple; membership-scoped authorization tests before multi-federation onboarding |
| G13 / P1 | Strong response schemas and frontend contract tests | Backend + frontend | Replace generic Map responses with typed DTO schemas; generate client and validate representative success/error payloads in CI |
| G14 / P1 | Fairness/reporting definitions | Product + backend | Confirm rating window, load constants and federation timezone; midnight/DST boundaries and fairness distribution tests |
| G15 / P1 | Privacy lifecycle | Product + backend/platform | Define retention, consent, deletion/anonymization, audited access and key rotation/re-encryption; purge jobs for expired auth artifacts/events |
| G16 / P2 | Receipt PDF and exports | Backend + frontend | Approved printable receipt template/PDF and reconciled paginated financial exports |
| G17 / P2 | Rating readback, richer search and aggregate pagination | Backend + frontend | GET existing job rating; filters/date ranges/total or cursor semantics; avoid using first page as aggregate |
| G18 / P2 | Insurance / e-Shram provider verification | Federation + backend | Authorized provider contract and consent, audited verification evidence; distinguish manually recorded from externally verified |
| G19 / P2 | Dispatch/analytics scale | Backend/platform | Query-plan/load evidence, eliminate eligible-worker N+1, bound candidate sets, scheduler backlog metrics, scalable reports and notification retention |

P0 launch items are necessary before public production use; G05 blocks end-to-end UI demonstration. P1/P2 ranking is a proposed implementation order, not a user-approved release schedule.

## Conflicts resolved

| Conflict | Resolution |
|---|---|
| Backend premium vs frontend fixed emergency price | User chose fixed default, retain backend configuration; surcharge seeded zero |
| Backend operational tuning vs frontend simple configuration | Backend supports tuning; ordinary admin UI shows price and welfare only |
| Society management title vs frontend “filter only” rule | Reference societies + scoped filters; no society CRUD |
| “Mutual OTP ensures physical presence” | Implemented customer authorization; documentation avoids an unprovable location guarantee |
| “Live payments/invoice” vs prototype mode | Explicit simulated status and demo receipt; no tax or settlement claim |
| “Backend not ready” in original frontend spec | Historical statement superseded by this implementation; frontend integration still required |

## Delivery boundary

The delivered backend covers the prototype core with transactional safeguards and reproducible tests. The table above is the remaining path to a complete production service; it deliberately avoids presenting missing providers or policy workflows as completed features.
