# EstatePilot AI MVP v4

Production-shaped v4 starter for an **AI Real Estate Experience OS**: listing CMS, AI media/copy workflows, 360/Matterport support, public landing pages, lead capture, lead scoring, seller reports, AI job queue and admin observability.

## v4 additions

- AI campaign center and campaign generation
- Follow-up task engine from lead scoring
- Calendar slot dashboard with ICS export
- Integration registry and onboarding playbook
- Property knowledge base for safer public chat
- Listing export package JSON
- Chat session/message persistence
- Smoke-check script: `npm run smoke`

## What is included

- Next.js + TypeScript + Tailwind
- Prisma + PostgreSQL schema
- agency-scoped dashboard
- richer listing data model
- public property landing page
- local image/video/PDF upload adapter
- AI image analysis and copy generation endpoints
- AI job queue with manual processing endpoint
- daily AI manager page
- lead capture + GDPR consent
- lead scoring and follow-up summary
- appointment request endpoint
- seller report generation + owner share portal
- notification log and mock/Resend email support
- webhook event storage
- admin observability page
- security headers and public rate limits
- seed data with demo listing, leads, reports and AI jobs

## Quick start

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

Open:

- App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Daily manager: http://localhost:3000/dashboard/daily
- Automation queue: http://localhost:3000/dashboard/automation
- Admin: http://localhost:3000/admin
- Public demo: http://localhost:3000/listing/budapest-13-kerulet-erkelyes-lakas-62m2
- Health check: http://localhost:3000/api/health

## Demo workflow

1. Create or open a listing.
2. Upload images/PDF/video from the media block.
3. Run `AI képelemzés` or queue `analyze_images`.
4. Queue `generate_listing_bundle` and process jobs on `/dashboard/automation`.
5. Publish the listing.
6. Submit a public lead form from the listing page.
7. Check `/dashboard/leads` and `/dashboard/daily`.
8. Generate a seller report and open the owner share URL.

## Environment

See `.env.example`.

Important modes:

- AI is mocked unless `OPENAI_API_KEY` is set.
- Email is mocked unless `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set.
- Storage is local by default through `STORAGE_DRIVER=local`.
- Auth is a dev stub through `DEFAULT_AGENT_EMAIL` until Clerk/Auth.js is wired.

## AI jobs

Supported MVP job types:

- `analyze_images`
- `generate_listing_bundle`
- `generate_seller_report`
- `recalculate_leads`
- `daily_manager`
- `staging_plan`

Jobs can be created through `/api/jobs` and processed through `/api/jobs/process`. In production, replace manual processing with BullMQ + Redis workers.

## Production notes

Read:

- `docs/ARCHITECTURE.md`
- `docs/PRODUCTION_CHECKLIST.md`
- `docs/V4_RELEASE_NOTES.md`
- `docs/API_SURFACE.md`

This is still not a final paid SaaS. It is a stronger v4 MVP codebase that a developer can run, extend, deploy and harden.


## v5 fejlesztési kör

A v5-ben bekerült egy production-szerűbb élesítési réteg:

- API key kezelés: `/dashboard/api-keys`, `/api/api-keys`
- import/export központ: `/dashboard/import-export`
- compliance audit: `/dashboard/compliance`
- security/ops oldal: `/dashboard/security`
- listing publish checklist: `/api/listings/:id/publish-checklist`
- listing package export: `/api/listings/:id/export-package`
- lead offer draft: `/api/leads/:id/offer-draft`
- public data-room: `/api/public/listings/:slug/data-room`
- security middleware headerek
- új dokumentációk: `docs/V5_RELEASE_NOTES.md`, `docs/DEPLOYMENT_RUNBOOK.md`, `docs/SECURITY_RBAC.md`, `docs/IMPORT_EXPORT.md`

### Ajánlott ellenőrzés

```bash
npm run check
```

Ha dependency telepítés vagy Prisma generálás nélkül nyitod meg a projektet, először:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```


## v6 production hardening

A v6 kör célja, hogy a kódbázis ne csak demóoldalak gyűjteménye legyen, hanem élesítésre előkészített SaaS alap:

- `/dashboard/ops` Production Doctor: env, DB, auth, storage, AI, email, fizetés, calendar, monitoring státusz.
- `/api/ops/doctor`: JSON health/config export fejlesztőnek vagy DevOps-nak.
- `/dashboard/billing`: csomagok, payment recordok, invoice recordok.
- `/api/billing/checkout-v2`: Stripe/Barion/manual checkout skeleton.
- `/api/uploads/intent`: R2/S3-ready upload intent adatmodell és API.
- `/dashboard/uploads`: upload object audit log.
- `/api/calendar/google/connect`: Google Calendar OAuth skeleton.
- `/api/reports/[id]/pdf`: PDF-render fallback HTML export, élesben Playwright/Puppeteer cserélhető.
- `npm run env:doctor`: CLI ellenőrzés deploy előtt.
- `npm run release:check`: env doctor + Prisma validate + typecheck + smoke.

Éles működéshez továbbra is szükséges: valódi Clerk/Auth.js session lookup, Cloudflare R2/S3 presigned URL adapter, Stripe/Barion SDK adapter, Google token exchange, Playwright/PDF render és teljes build-teszt.


## v7 hardening layer

A v7 hozzáadja a production felé szükséges kontrollréteget:

- Data quality audit és publish gate
- Portal export payload generátor
- GDPR consent ledger
- Security event log
- Feature flag rendszer
- Sales cockpit
- Release readiness API
- Static audit és route inventory

Új ellenőrzés:

```bash
npm run release:deep-check
```

Új dokumentációk:

- `docs/V7_RELEASE_NOTES.md`
- `docs/DEVELOPER_HANDOFF.md`
- `docs/DEMO_SCRIPT.md`
- `docs/V7_NEXT_STEPS.md`


## V8 fejlesztési kör

A v8 új moduljai: Agency Team OS, Deal Pipeline, Proposal Draft Center, Valuation & Market Position, Seller Activity Feed, Demo Center, Chat Knowledge Gaps és Developer Handoff Score. Futtatáshoz: `npm run release:v8-check`, demo exporthoz: `npm run demo:package`.


## V9 additions

- White-label brand center
- HU/EN/DE listing translations
- Buyer persona intelligence
- AI chat guardrails
- Partner API v2 contract
- SLA/support desk foundation

Run `npm run release:v9-check` after installing dependencies and pushing the Prisma schema.


## V10 enterprise readiness layer

V10 adds the governance and enterprise handoff layer:

- AI Decision Ledger
- GDPR / DSR request center
- Customer Success Health
- Product Feedback / NPS loop
- Listing Improvement Engine
- AI Evaluation Suite
- Backup Snapshot Center
- Release Channel + Changelog
- SDK examples

Run the V10 readiness check locally:

```bash
npm run release:v10-check
```

The package is still a developer handoff. A real production release requires local install/build verification, real auth, real storage, OpenAI provider calls, payment live mode and deployment QA.


## V11

V11 adds launch operations and enterprise demo readiness: launch checklist, tenant boundary audit, AI cost budget, monitoring probes, data retention policies, enterprise audit export, demo sandbox reset plan, investor/demo metrics and sales playbook.

Run:

```bash
npm run release:v11-check
```

New pages: `/dashboard/v11-readiness`, `/dashboard/launch`, `/dashboard/cost-control`, `/dashboard/tenant-boundary`, `/dashboard/monitoring`, `/dashboard/retention`, `/dashboard/audit-exports`, `/dashboard/sandbox`, `/dashboard/investor-demo`.


## V12 Go-Live Controls

A v12 új go-live ellenőrző réteget ad:

- `/dashboard/v12-readiness` — végső pilot/production readiness command center
- `/dashboard/providers` — OpenAI, R2/S3, Resend, Stripe/Barion, Google Calendar, Auth, Sentry, PostHog állapot
- `/dashboard/acceptance` — demo/pilot acceptance suite
- `/dashboard/deployment` — local/staging/production gate-ek
- `/dashboard/domains` — domain + SSL readiness
- `/dashboard/secrets` — secret rotation checklist
- `/dashboard/observability` — SLO targetek és synthetic journeyk

Új ellenőrzés:

```bash
npm run release:v12-check
```

Megjegyzés: a v12 sem tárol secret értékeket adatbázisban, csak az ENV-konfiguráció meglétét és rotációs állapotát naplózza.


## V13 — Pilot governance & developer contract

V13 adds the layer that makes the project easier to pilot with a real agency and easier to hand off to developers:

- API Contract Center: `/dashboard/contract`
- Error Taxonomy: `/dashboard/error-taxonomy`
- Usage Metering: `/dashboard/metering`
- Pilot Onboarding: `/dashboard/pilot-onboarding`
- V13 Release Gates: `/dashboard/release-gates`
- V13 Pilot Readiness: `/dashboard/v13-readiness`

New check command:

```bash
npm run release:v13-check
```

New API endpoints:

- `GET /api/ops/v13-readiness`
- `GET /api/contracts/openapi`
- `POST /api/contracts/openapi`
- `GET /api/errors/taxonomy`
- `GET /api/metering/usage`
- `POST /api/metering/usage`
- `GET /api/pilot/onboarding`
- `POST /api/release-gates/run`

Important: this remains a developer handoff package until `npm install`, `db:push`, `db:seed`, `release:v13-check`, `build` and real provider integrations pass in a local/staging environment.


## V14 highest-level pilot hardening

V14 focuses on the first sellable pilot flow instead of adding more feature placeholders.

New dashboards:

- `/dashboard/v14-readiness`
- `/dashboard/core-flow`
- `/dashboard/adapters`
- `/dashboard/e2e-scenarios`
- `/dashboard/launch-risks`

Run the strongest local check:

```bash
npm run release:v14-check
npm run build
```

Use `.env.production.example` as the go-live provider checklist.


## V16 3D / Digital Twin fejlesztések

A v16 célja a 3D modellterves irány komolyabb előkészítése. Bekerült a guided capture workflow, a 3D provider matrix, a digital twin readiness audit, a spatial pipeline és a Gaussian Splatting worker/API szerződés előkészítése.

Új fontos route-ok:

- `/dashboard/v16-readiness`
- `/dashboard/3d-capture`
- `/dashboard/3d-pipeline`
- `/dashboard/digital-twins`
- `/dashboard/spatial-assets`

Új check:

```bash
npm run release:v16-check
```

Fontos: a v16 még nem kész saját GPU-s 3D rekonstrukciós motor, hanem production-ready előkészítés és provider-kapcsolási réteg. A tényleges automata fotó/videó → 3D modell generáláshoz külső provider vagy saját worker bekötés szükséges.


## V17 — 3D Spatial Worker Execution Layer

A v17 a 3D modellterves részt tovább húzza: nem csak előkészített provider-mátrix van, hanem konkrét processing job API, worker simulation, scene manifest, 3D quality gate és publikus viewer shell is.

Fontos route-ok:

- `/dashboard/v17-readiness`
- `/dashboard/3d-worker`
- `/dashboard/3d-scenes`
- `/dashboard/3d-quality`
- `/dashboard/3d-viewer-adapters`
- `/spatial/[sceneId]`

Ellenőrzés:

```bash
npm run release:v17-check
```

3D dry-run flow:

```bash
# 1. hozz létre 3D processing jobot
POST /api/3d/jobs

# 2. simulation módban fejezd be
POST /api/3d/jobs/[id]/simulate

# 3. manifest / viewer
GET /api/3d/scenes/[id]/manifest
```


## V18 highest-level 3D execution

The latest package adds a concrete 3D reconstruction execution layer:

- V18 readiness dashboard: `/dashboard/v18-readiness`
- reconstruction dispatch contract: `/api/3d/reconstruction/dispatch`
- strict scene manifest validation: `/api/3d/manifests/validate`
- AI room graph draft: `/dashboard/room-graph`
- 3D acceptance pack: `/dashboard/3d-acceptance`
- GPU worker deployment skeleton: `workers/spatial-gpu`
- GPU compose file: `docker-compose.gpu.yml`

Run locally:

```bash
npm install
npm run db:push
npm run db:seed
npm run release:v18-check
npm run build
npm run dev
```

Known limitation: the repository contains the contract, worker skeleton and acceptance gates; a real GPU reconstruction engine or external provider still has to be connected for production-grade automatic 3D scene generation.


## V19 Enterprise Spatial Production Layer

V19 adds the production layer around the 3D/digital-twin system:

- Spatial Production Orchestrator
- Dataset versioning and asset lineage
- Human QA / scene review queue
- Tenant-safe viewer deployment
- Spatial SLA probes
- Seller/buyer/internal 3D share packages

Main check:

```bash
npm run release:v19-check
```

Important: V19 still requires a live 3D reconstruction provider or GPU worker to create real `.ksplat`, `.splat` or `.ply` files. The app now contains the contract, orchestration, QA, viewer deployment and sharing layer for that pipeline.


## V21 start-before-launch

A V21 kör a hat amerikai-szintű gapet vezeti be start előtt: stabil build, live AI, live 3D provider bridge, premium UX demo, CRM automation és integrációs launch matrix.

```bash
npm run release:v21-check
npm install
npm run db:push
npm run db:seed
npm run typecheck
npm run build
npm run dev
```

Új fő dashboard: `/dashboard/v21-start`.


## V22 American-grade start hardening

The v22 layer turns the six remaining American-level gaps into explicit start gates:

1. Production build proof
2. Live AI SLA + evals
3. Spatial / Gaussian Splatting provider acceptance
4. Premium UX benchmark
5. CRM revenue automation QA
6. Provider certification matrix

Run the no-dependency artifact check:

```bash
npm run release:v22-check
```

Run the full local proof on a machine with dependencies available:

```bash
npm run release:v22-full
```
