# Security és RBAC terv

## Szerepkörök

- `ADMIN`: teljes rendszer
- `AGENCY_OWNER`: saját agency, billing, API kulcsok, csapat
- `AGENT`: saját agency listingek, leadek, kampányok
- `SELLER`: csak saját seller report link/token
- `BUYER`: publikus landing és lead/chat flow

## Jelenlegi állapot

A v5-ben az RBAC helper réteg már megvan: `requireRole`, `requireListingAccess`, `getCurrentUser`. Productionben a `getCurrentUser()` demo-stub helyére Clerk/Auth.js session lookup kerül.

## Kötelező élesítés

1. `getCurrentUser()` Clerk/Auth.js session alapján.
2. Agency membership ellenőrzés minden dashboard és API route-on.
3. API key scope enforcement partner endpointoknál.
4. Rate limit Redisben, IP + agency + endpoint kulccsal.
5. Audit log minden write actionre.
6. Seller token rotáció és lejárat.
7. Sensitive adatok maszkolása exportnál.
