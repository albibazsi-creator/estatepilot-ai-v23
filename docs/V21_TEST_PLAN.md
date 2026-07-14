# V21 test plan

## Phase 1 — artifact QA

Run:

```bash
npm run release:v21-check
```

Expected: PASS.

## Phase 2 — dependency QA

Run:

```bash
npm install
npm run typecheck
npm run build
```

Expected: no TypeScript or Next build errors.

## Phase 3 — pilot data flow

1. Seed demo database.
2. Open dashboard.
3. Open one listing.
4. Generate AI description.
5. Open public listing.
6. Submit a lead.
7. Recalculate lead score.
8. Generate seller report.
9. Open 3D readiness and viewer shell.

## Phase 4 — provider switch

Switch OpenAI, storage, email, auth and monitoring from mock to live one by one. Never switch all providers at once before the first successful dry-run.
