# Verification evidence

**Verified 19 September 2026:** `./mvnw spotless:apply verify` completed successfully on Java 21. Surefire reports **16 tests, 0 failures, 0 errors, 0 skipped**. Tests use a disposable `postgis/postgis:16-3.5` container and real Flyway migrations, not an in-memory substitute.

| Test area | Behavior verified |
|---|---|
| Full lifecycle | Worker onboarding/approval, booking, accept/travel/arrive/OTP/start/complete, simulated payment, receipt, rating |
| Same-job acceptance race | Two workers accept concurrently; exactly one wins |
| Cross-job worker race | One worker accepts two jobs concurrently; only one active assignment |
| Eligibility | Unverified, distant, stale-location and busy workers excluded |
| OTP and ownership | Code hidden from other roles, wrong-attempt lockout, invalid transition rejection |
| Scheduled dispatch | Wait before dispatch window, sequential offer expiry and next candidate |
| Emergency fallback | Broadcast timeout, unfulfilled state and audited manual dispatch |
| Price snapshot | Configurable surplus produces correct welfare/earnings; later config changes preserve original financial terms |
| Idempotency | Same booking key/body replays, changed request conflicts |
| Session security | Refresh rotation/reuse revokes family; logout invalidates access |
| Boundaries | Role and ownership checks, malformed/unknown input, invalid prices, unconfigured forecast |
| Retry/cancellation | Offer history archived on retry; cancellation blocks acceptance |
| Configuration concurrency | Stale version conflicts; invalid weight sum rejected |
| Fixed-price frontend contract | All booking types default to INR 500; emergency score absent; offer earnings fields, metrics and losing-worker event |
| OTP renewal | Expired code cannot start work; owner renews, worker cannot read; valid replacement authorizes start |
| API documentation | Runtime OpenAPI public/private security declarations, Swagger redirect/assets/config access; writes target/openapi.json |

## Reproduce

```sh
cd backend
./mvnw verify
```

Docker must be running and able to pull the PostGIS image. Tests isolate fixtures by truncating their disposable database, including auth challenges. The test scheduler is disabled so time-dependent cases can control stored deadlines and invoke dispatch deterministically. Concurrency tests call the real transactional HTTP/controller path with separate requests.

Generated test reports: `backend/target/surefire-reports/`. They are build artifacts, not committed evidence. The OpenAPI snapshot under docs is copied from the verified runtime response; regenerate it after route/schema changes.

## Documentation checks

The offline interactive guide was checked in the in-app browser: booking-mode changes, ARRIVED authorization details, emergency surplus example (INR 600 gross / 550 worker / 50 welfare), fixed on-demand pricing, API role/search filters and expandable operations. No console errors were reported. Layout overflow checks passed at 390px and 1280px; the desktop architecture diagram was visually reviewed.

All 49 curated operations match the generated OpenAPI method/path inventory. The checked-in snapshot matches the test-generated file byte for byte. Local documentation file links resolve. `docker compose config --quiet` passes.

## Packaged application check

The built executable JAR started with the `dev` profile against the Compose PostgreSQL/PostGIS database. HTTP checks passed for health (`UP`), the category catalog, live OpenAPI, the Swagger redirect and page, both Swagger assets, and Swagger configuration. The check used API port 8088 and database port 15432 to avoid existing local services. The application and database were stopped after verification; this was a local check, not a deployment.

## Not established by this suite

- Browser/frontend integration, accessibility, translations, map behavior or mobile permissions.
- Real SMS, gateway webhook settlement, refunds, payouts, government verification or external model accuracy.
- Production profile end-to-end operation, deployment-platform behavior, failover, backup restoration or secret rotation.
- Sustained-load latency, large worker pools, scheduler backlog behavior or fairness over representative populations.
- Exhaustive validation/fuzzing, full authorization matrix, penetration testing or full response schema contract coverage.

See [frontend handoff](frontend-handoff.md) for human integration acceptance and [gap register](gaps.md) for remaining gates.
