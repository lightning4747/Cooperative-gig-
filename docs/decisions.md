# Decision register

| ID | Decision | Status / consequence |
|---|---|---|
| D01 | Fixed prices for every booking type; emergency surcharge defaults to zero, backend support remains configurable | **User approved.** Frontend must render the quote, never infer a surcharge |
| D02 | One Spring Boot modular monolith, Java 21, PostgreSQL/PostGIS | Implemented; supports atomic job and ledger changes |
| D03 | Society is an organization/filter, not another application role | Aligns frontend specification; no society CRUD UI or API |
| D04 | Frontend admin configuration shows fixed service prices and welfare rule | Aligns frontend specification; operational weights/radii/timeouts/surcharge remain backend capabilities |
| D05 | Explicit `STANDARD`, `ON_DEMAND`, `EMERGENCY` values; STANDARD requires future schedule | Implemented; dispatch begins 15 minutes before schedule |
| D06 | Emergency fallback is an explicit change to ON_DEMAND, retaining the original price snapshot | Provisional; frontend must describe this as on-demand fallback, not promise a newly scheduled booking |
| D07 | Worker must be ACTIVE, skill-verified, available, fresh-located and not busy | Implemented for both automatic and manual dispatch; admin cannot override these gates |
| D08 | GPS freshness 15 minutes; no retained GPS trail | Provisional operational policy; UI shows stale timestamp and requests an update |
| D09 | Sequential offers last 60 seconds; emergency window configurable 60–90 seconds; at most 3 retries | Implemented bounded recovery; tune only after product agreement |
| D10 | Doorstep OTP lasts 10 minutes, maximum 5 wrong attempts; customer renews after expiry | Implemented; authorization proof, not physical presence proof |
| D11 | New worker starts with neutral rating 3/5; subsequent average covers all recorded ratings | Provisional. A rolling rating window is not implemented |
| D12 | Daily/weekly/idle load normalization uses 8 jobs/day, 40 jobs/week, 24 idle hours | Provisional fairness constants; review with federation before operational use |
| D13 | Database day defaults to UTC | Provisional. Federation reporting timezone (likely Asia/Kolkata) needs agreement and boundary tests |
| D14 | Welfare is funded only from surplus; base wage untouched | Implemented. Fixed-price default generates no welfare contribution; funding policy remains a product gap |
| D15 | All seeded services cost INR 500 and last 60 minutes | Demo data only. Replace through approved catalog migration; no price credibility implied |
| D16 | Development OTP and simulated payments are explicit development capabilities | Production defaults disable them and return 503 where integration is absent |
| D17 | Admin records verification and insurance status manually | No e-Shram or insurer API claims; UAN validation is format + duplicate checking only |
| D18 | Poll durable notification events and authoritative job/offer views | Implemented prototype; WebSocket/SSE/push delivery remains outstanding |
| D19 | Price/welfare/config version frozen at quote; allocation policy read when dispatch runs | Implemented; old quotes remain valid until expiry and old jobs keep financial terms |
| D20 | Existing user role is preserved at login; public registration cannot select ADMIN | Implemented. Initial admin is provisioned by operator configuration |

## Unresolved policy decisions

| Question | Present behavior | Required decision |
|---|---|---|
| Worker suspension during assigned work | Blocks new work; existing assigned job can continue | Safe handover, cancellation and customer communication policy |
| Cancellation after work starts | Rejected | Charge, compensation, dispute and refund policy |
| Rejected onboarding corrections | No resubmit/update route | Allowed fields, evidence and re-verification workflow |
| Materials and extras | No variable extra charge supported | Consent and pricing workflow before charging |
| Scheduled capacity | No reservation or guaranteed SLA | Lead time, capacity limits, lateness and reassignment |
| Welfare benefits/claims | Contribution ledger only | Eligibility, approvals, disbursement and funding |
| Multiple federations | One seeded federation; ADMIN has platform-wide administrative scope | Tenant boundaries and scoped administrator membership |
