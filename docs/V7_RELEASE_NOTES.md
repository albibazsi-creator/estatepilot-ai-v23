# V7 Release Notes — Production Hardening & Sales OS

A v7 célja nem újabb látványos placeholder funkció volt, hanem az MVP élesítéséhez szükséges kontrollréteg.

## Új fő részek

- Data quality audit: listingenként hiányzó adatok, kevés kép, gyenge fotó, hiányzó tour/alaprajz/disclosure jelzése.
- Publish hard gate: a publikálás most checklist + data quality alapján blokkolható.
- Portal export center: validált export payload Ingatlan.com / marketplace / custom JSON irányhoz.
- Consent ledger: GDPR hozzájárulási napló lead capture és follow-up bizonyítékhoz.
- Security event log: publikus lead beküldések és későbbi security események naplózhatók.
- Feature flag központ: új funkciók fokozatos bekapcsolásához.
- Sales cockpit: leadek, follow-up taskok, appointmentek és billing pipeline egy nézetben.
- Release readiness API: konfiguráció, adatok, failed jobok, export hibák, quality issue-k alapján readiness score.
- Static audit és route inventory script.

## Új oldalak

- `/dashboard/quality`
- `/dashboard/portal-exports`
- `/dashboard/consents`
- `/dashboard/feature-flags`
- `/dashboard/sales`

## Új API-k

- `POST /api/listings/:id/data-quality`
- `GET /api/listings/:id/data-quality`
- `POST /api/listings/:id/portal-export`
- `GET /api/portal-exports/:id`
- `GET/POST /api/consents`
- `GET/POST /api/feature-flags`
- `GET /api/security/events`
- `GET /api/ops/readiness`
- `GET /api/ops/rbac`

## Új modellek

- `PortalExport`
- `ConsentRecord`
- `DataQualityIssue`
- `FeatureFlag`
- `SecurityEvent`

## Új release parancsok

```bash
npm run static:audit
npm run routes:inventory
npm run release:deep-check
```

## Fontos

A v7 még mindig nem helyettesíti az éles provider bekötéseket. A rendszer viszont már fejlesztői átadásra sokkal komolyabb: pontosan látszik, mit kell konfigurálni, auditálni, exportálni, publikálni és tesztelni.
