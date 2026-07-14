# EstatePilot AI MVP v5 release notes

A v5 célja az volt, hogy a v4-es AI Listing Conversion OS demót közelebb vigye egy fejlesztőnek átadható, production-szerű SaaS alaphoz.

## Új fő modulok

- API key kezelés előkészítve agency owner szerepkörre
- import/export központ JSON és CSV exporttal
- bulk listing import endpoint
- publish checklist endpoint listingenként
- compliance audit AI outputként mentve
- public data-room endpoint a listing publikus, biztonságos exportjához
- partner API key enforcement helper + API key protected listing feed
- lead offer/follow-up draft generátor
- admin audit API
- session debug endpoint az auth cseréhez
- middleware security headerekkel
- külön Security / üzemeltetés dashboard

## Új endpointok

- `GET /api/auth/session`
- `GET /api/api-keys`
- `POST /api/api-keys`
- `POST /api/api-keys/:id/revoke`
- `GET /api/admin/audit`
- `GET /api/exports/listings?format=json|csv`
- `POST /api/import/listings`
- `GET /api/listings/:id/publish-checklist`
- `POST /api/listings/:id/compliance-audit`
- `POST /api/leads/:id/offer-draft`
- `GET /api/public/listings/:slug/data-room`
- `GET /api/partner/listings`

## Új dashboard oldalak

- `/dashboard/import-export`
- `/dashboard/compliance`
- `/dashboard/api-keys`
- `/dashboard/security`

## Fontos megjegyzés

A v5 továbbra is fejlesztői MVP. Az auth még demo-stub, az API key route működésre előkészített, de éles partner endpointoknál scope enforcementet még rá kell húzni. A rate limit memória-alapú; productionben Redis kell.
