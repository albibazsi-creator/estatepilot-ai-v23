# EstatePilot AI MVP v6 Release Notes

## Cél

A v6 nem újabb látványos demómodulokra ment rá, hanem arra, hogy az eddigi v5 kódbázis közelebb kerüljön egy élesíthető SaaS alaphoz.

## Új részek

### Production Doctor

- `lib/config-doctor.ts`
- `/dashboard/ops`
- `/api/ops/doctor`
- `npm run env:doctor`

Ellenőrzi: app URL, PostgreSQL, auth provider, storage, OpenAI, email, billing, calendar, monitoring.

### Billing v2 skeleton

- `lib/billing.ts`
- `/dashboard/billing`
- `/api/billing/plans`
- `/api/billing/checkout-v2`
- Prisma: `PaymentRecord`, `InvoiceRecord`, `BillingCustomer`

Kulcs nélkül manual checkout módot ad vissza, kulccsal Stripe/Barion adapter helye készen áll.

### Upload intent / R2-S3 előkészítés

- `lib/upload-intent.ts`
- `/api/uploads/intent`
- `/dashboard/uploads`
- Prisma: `UploadObject`

Local módban a régi form uploadot használja, R2/S3 módban presigned adapter helye elő van készítve.

### Google Calendar skeleton

- `lib/calendar-google.ts`
- `/api/calendar/google/connect`
- `/api/calendar/google/callback`
- Prisma: `CalendarConnection`

OAuth URL generálás már van, token exchange adapter még provider-specifikus bekötést igényel.

### AI trace

- `lib/ai-trace.ts`
- Prisma: `AiTrace`

Ezzel később mérhető lesz, melyik AI művelet futott, milyen modellel, milyen státusszal és hibával.

### Report PDF fallback

- `lib/pdf.ts`
- `/api/reports/[id]/pdf`

Most HTML exportot ad PDF-layouttal. Élesben Playwright/Puppeteer vagy managed PDF API kell.

## Fejlesztői átadásnál kiemelendő

A v6 után a projekt már tartalmazza a legtöbb production concern helyét:

- env readiness
- upload audit
- billing records
- invoice records
- calendar connections
- AI trace
- ops dashboard
- security checklist
- release check script

## Még nem kész teljesen

- nincs valódi Clerk/Auth.js session bekötés
- nincs valódi R2/S3 presigned PUT
- nincs Stripe/Barion session létrehozás SDK-val
- nincs Google OAuth token exchange
- nincs Playwright/PDF render
- nincs teljes npm install/build ellenőrzés ebben a környezetben
