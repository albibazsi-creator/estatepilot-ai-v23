# V8 Release Notes — Team, Pipeline, Valuation, Demo Center

V8 továbbviszi a v7 production hardeninget egy eladhatóbb, agent/agency workflow fókuszú irányba.

## Új fő modulok

- Agency Team OS: csapattagok és invite token alap.
- Deal Pipeline: leadekből forecastolt pipeline tételek.
- Proposal Draft Center: call script + email draft + következő akciók forró leadekhez.
- Valuation & Market Position: manuális comparable mintákból Ft/m² pozíció.
- Seller Activity Feed: tulajdonosnak kommunikálható aktivitási napló.
- Demo Center: 12 perces sales demo forgatókönyv és checklist.
- Chat Knowledge Gaps: property chat hiányzó adatainak gyűjtése.
- Developer Handoff Score: átadási érettségi ellenőrzés.

## Új API-k

- `GET/POST /api/team/invites`
- `GET/POST /api/deals`
- `PATCH /api/deals/[id]`
- `GET /api/proposals`
- `POST /api/proposals/generate`
- `GET/POST /api/valuation/comparables`
- `GET/POST /api/seller/activities`
- `GET/POST /api/demo/runs`
- `POST /api/chat/safe-answer`
- `GET /api/chat/gaps`
- `GET /api/ops/handoff`

## Új dashboard oldalak

- `/dashboard/team`
- `/dashboard/deals`
- `/dashboard/proposals`
- `/dashboard/valuation`
- `/dashboard/seller-activities`
- `/dashboard/demo-center`
- `/dashboard/chat-gaps`
- `/dashboard/handoff`

## Új Prisma modellek

- `TeamInvite`
- `DealPipelineItem`
- `ProposalDraft`
- `SellerPortalActivity`
- `ValuationComparable`
- `DemoRun`
- `ChatKnowledgeGap`

## Megjegyzés

Ez továbbra sem végleges production SaaS. A v8 célja az, hogy a termék ne csak technikai demó, hanem sales-demo és ügynökségi workflow szinten is átadhatóbb legyen.
