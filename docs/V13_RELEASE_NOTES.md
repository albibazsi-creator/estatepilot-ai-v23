# V13 Release Notes — Pilot Governance & Developer Contract

V13 moves the project from “large SaaS demo” toward a pilot-ready operating package. The main goal is to make the product easier to validate with a real agency, easier to hand to a developer, and safer to iterate.

## Added

### API Contract Center
- OpenAPI-like contract generator.
- Discovered API routes from `app/api/**/route.ts`.
- Stable manually-described endpoints for public listing, lead capture, provider health, readiness and metering.
- Snapshot persistence with checksum.
- Dashboard: `/dashboard/contract`.
- API: `/api/contracts/openapi`.

### Error Taxonomy
- Central error code registry.
- Categories for auth, privacy, AI, storage, billing, abuse, ops and guardrails.
- Retryability, owner area, public message and remediation fields.
- Dashboard: `/dashboard/error-taxonomy`.
- API: `/api/errors/taxonomy`.

### Usage Metering
- Feature-level usage ledger.
- Estimated HUF cost tracking for listing hosting, lead capture, AI copy generation, seller reports and AI jobs.
- Dashboard: `/dashboard/metering`.
- API: `/api/metering/usage`.

### Pilot Onboarding
- 7-day pilot milestone plan.
- Owner, due date, evidence and status fields.
- Dashboard: `/dashboard/pilot-onboarding`.
- API: `/api/pilot/onboarding`.

### V13 Release Gates
- Combined gate for V12 readiness, API contract, error taxonomy, metering and pilot onboarding.
- Stores gate runs with score, commit SHA and check evidence.
- Dashboard: `/dashboard/release-gates`.
- API: `/api/release-gates/run`.

### CI/CD Templates
- `.github/workflows/ci.yml` for install, Prisma validate, typecheck, smoke and V13 release check.
- `.github/workflows/release.yml` for manual release-gate execution.

## New checks

```bash
npm run contract:generate
npm run errors:audit
npm run metering:audit
npm run pilot:onboarding
npm run release:gates
npm run v13:readiness
npm run release:v13-check
```

## Current limitations

This is still a developer handoff package. The full dependency install and production build were not completed in this environment due to install timeouts. Before selling as a live SaaS, run the V13 checklist locally and wire real providers: Auth, OpenAI, R2/S3, email, billing, monitoring and calendar.
