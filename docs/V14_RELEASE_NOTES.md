# V14 Release Notes — Highest-Level Pilot Hardening

V14 deliberately stops adding random feature surface and focuses on the first sellable pilot flow:

**agent creates listing → media is ready → AI outputs are generated → public landing is publishable → lead arrives → lead is scored → seller report is generated → campaign/deal follow-up exists.**

## Added

- Core Pilot Flow engine and dashboard
- Production Adapter switchboard for auth, AI, storage, email, billing, calendar and monitoring
- V14 E2E scenario runner
- Launch Risk Register
- V14 readiness command center
- Production env template
- Vercel deployment config
- Dockerfile
- New release command: `npm run release:v14-check`

## Why this matters

V13 had many enterprise/governance modules. V14 makes the product more realistic by exposing exactly what still blocks an actual paid pilot.
