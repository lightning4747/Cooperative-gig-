# Cooperative Gig Services Platform

[![License](https://img.shields.io/badge/License-Cooperative--Ethical-emerald.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-21%20LTS-blue.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20PostGIS%203.5-336791.svg)](https://postgis.net/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker%20Compose-Ready-2496ed.svg)](https://docker.com)

A production-grade, full-stack digital cooperative household services platform engineered under Ministry of Cooperation and NCCT ethical guidelines.

The platform provides a complete alternative to extractive gig economy models by guaranteeing **100% statutory worker base-wage floor protections**, funding social security and healthcare strictly through **transparent dispatch surplus**, executing **deterministic algorithmic dispatch**, and providing **full federation oversight**.

---

## Quick Start with Docker Compose

Run the entire platform (Database, Spring Boot API, and Nginx-powered React Frontend) with a single command:

```bash
docker compose up --build -d
```

### Active Services & Endpoints

| Service | Container Name | Internal Port | Host Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web App** | `cooperativegig-frontend-1` | `80` | [http://localhost:3000](http://localhost:3000) | Complete Customer, Worker, and Federation UI |
| **Spring Boot API** | `cooperativegig-api-1` | `8080` | [http://localhost:8080](http://localhost:8080) | Core REST APIs, dispatch engine, billing & auth |
| **PostgreSQL + PostGIS** | `cooperativegig-db-1` | `5432` | `localhost:5432` | Geo-spatial database, ledger tables & audit logs |
| **API Healthcheck** | — | — | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) | Container healthcheck & liveness probe |
| **Swagger / OpenAPI** | — | — | [http://localhost:8080/docs/api](http://localhost:8080/docs/api) | Interactive OpenAPI 3.0 documentation |

*Tip: You can customize host ports via environment variables: `FRONTEND_PORT=80 docker compose up -d`.*

---

## Production-Grade Documentation Index

Comprehensive, modular documentation is maintained in the [`/docs`](docs/) directory:

| Document | Scope & Contents |
| :--- | :--- |
|[**Backend Architecture & Technical Changes**](docs/backend-architecture-and-changes.md) | In-depth breakdown of Spring Boot architecture, PostgreSQL PostGIS schema, surplus welfare mathematics, automatic completion settlement, and federation queries. |
|[**Frontend Architecture & User Journeys**](docs/frontend-architecture.md) | Production-grade frontend specification covering React 19, Vite, TanStack Query caching, Customer/Worker/Federation workflows, design system, and Nginx reverse proxy. |
|[**API Contract & Schema Specification**](docs/api-contract.md) | Complete endpoint catalog, request/response JSON schemas, idempotency locks, and error code taxonomy. |
|[**Decisions & Cooperative Policy Register**](docs/decisions.md) | Architectural Decision Records (ADRs) on statutory wage protection, zero-surge policies, and welfare pool governance. |
|[**Interactive Visual Documentation**](docs/index.html) | Offline-capable visual documentation with interactive state machine diagrams and pricing calculators. |

---

## Platform Core Features

### 1. Citizen Customer Experience (`/customer`)
- **Multilingual Catalog Discovery**: Browse verified trades (Plumbing, Electrical, Housekeeping, Carpentry, Caregiving) with instant language switching (English, Hindi, Tamil).
- **Transparent 3-Tier Dispatch**:
  - *Standard Scheduled*: Planned slots with $+₹100$ surplus ($₹50$ to Welfare Fund / $+₹50$ Worker Bonus).
  - *On-Demand*: Immediate dispatch with $+₹150$ surplus ($₹75$ to Welfare Fund / $+₹75$ Worker Bonus).
  - *Emergency Priority*: High-urgency regional broadcast with $+₹250$ surplus ($₹125$ to Welfare Fund / $+₹125$ Worker Bonus).
- **Live Dispatch Tracking**: Real-time Leaflet transit map, doorstep arrival notification, and mutual 6-digit OTP display.
- **Settlement & Invoicing**: View official digitally certified cooperative receipts (`/customer/jobs/:id/invoice`) with society registration numbers and rate verified members.
- **Smart Active Job Management**: Automatically isolates running dispatches; displays a clean "No Live Jobs" state with booking history when no jobs are active.

### 2. Citizen Worker Experience (`/worker`)
- **Statutory Wage-Floor Guarantee**: 100% of the statutory base price is guaranteed directly to the worker—zero commissions and zero deductions.
- **Real-Time Dispatch Radar**: Instant `AVAILABLE` / `OFFLINE` toggle with incoming offer countdowns.
- **Doorstep Mutual OTP Verification**: Secures proof of arrival before starting tasks.
- **Instant Completion Settlement**: Completing a job automatically records payment, issues customer invoice, and credits the worker's welfare fund immediately.
- **Cooperative Welfare Pool**: Live individual welfare balance view accrued from customer surplus, along with PMSBY (₹2 Lakh Accidental) and PMJJBY (₹2 Lakh Life) insurance badges.

### 3. Federation Operations & Governance (`/federation`)
- **Regional Liquidity Oversight**: Real-time metrics for active workers, available workers, jobs today, and collective welfare reserves.
- **Dynamic Pending Approvals**: Synchronized badge tracking pending worker credential verifications.
- **Member Welfare Accounts Ledger**: Auditable per-worker balance ledger tracking individual surplus contributions, trade references, and timestamps.
- **KYC & e-Shram Verification**: Approves onboarding credentials and authorizes specific certified trade categories.
- **Tariff & Allocation Control**: Configure regional minimum base wages and fine-tune dispatch weights (proximity, rating, load leveling).
- **Analytical & Forecasting Suite (`/federation/forecast`)**:
  - *Historical Records & Trends*: Real-time 7/14/30/60-day factual analysis of completed dispatches, emergency volumes, gross revenues, and star ratings directly from PostgreSQL facts.
  - *Workforce Gap & Capacity Matrix*: Dynamic audit comparing verified technician counts to demand per trade, with automated deficit alerts for trade shortages.
  - *Demand Forecasting Engine*: Deterministic prediction engine computing forward demand estimates, capacity ratios, and actionable recruitment recommendations using real DB aggregates.

---

## Architecture & Design System Innovations

### Engineered Design System Tokens
- **Institutional Palette & Semantics**: Cohesive design system built on refined CSS variables and Tailwind utility tokens, featuring warm amber active outlines (`border-amber-500 text-amber-600 bg-amber-50/20`), golden badge tokens, and accessible WCAG AAA compliant contrast levels.
- **Micro-Interactions & Component Elevation**: Minimalist elevation layers, crisp 1px borders, subtle transitions, and high-visibility state indicators for loading, alerts, and active challenges.

### Responsive Mobile Architecture
- **360px Small-Screen Resilience**: Specially engineered mobile layouts with flex-prefix containers (`[Phone Icon | +91] [Input]`) with `shrink-0` bounds and flex-fill inputs that eliminate text clipping and horizontal overflow on compact viewports.
- **Mobile-First Touch Ergonomics**: Tap targets conforming to 44px+ guidelines, bottom sheets, full-width action bars, and clean single-column task flows.

### Full-Screen Desktop Federation Console
- **Expansive Operations Suite (`/federation`)**: High-density widescreen desktop layout providing governance officers with comprehensive real-time regional liquidity telemetry, worker verification queue management, tariff management, and collective welfare ledger audits.

---

## Verified Demo Credentials

The platform includes pre-seeded demonstration accounts for immediate exploration via the **Quick Login** buttons:

| Role | Demo Name | Demo Mobile Number | Default Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | Ravi Kumar | `9876543210` | Book services, track dispatches, inspect invoices |
| **Worker** | Arun | `9876543211` | Receive offers, verify doorstep OTP, view earnings & welfare |
| **Federation Admin** | Apex Administrator | `9999999999` | Verify workers, inspect welfare ledger, configure tariffs |

