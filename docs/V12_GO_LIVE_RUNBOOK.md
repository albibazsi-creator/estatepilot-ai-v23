# V12 Go-Live Runbook

## 1. Lokális ellenőrzés

```bash
npm install
npm run db:push
npm run db:seed
npm run release:v12-check
npm run build
npm run dev
```

## 2. Provider élesítés

A `/dashboard/providers` oldalon ellenőrizd, hogy az OpenAI, R2/S3, Resend, billing, Google Calendar, auth, Sentry és PostHog melyik módon fut: `ready`, `partial` vagy `mock`.

## 3. Acceptance teszt

A `/dashboard/acceptance` oldalon futtasd le a go-live demo suite-ot. Kritikus, hogy legyen legalább egy listing, lead, seller report és sales workflow.

## 4. Domain és SSL

A `/dashboard/domains` oldalon ellenőrizd az app és listing domain státuszát. Éles előtt a domain legyen `verified`, az SSL pedig `valid`.

## 5. Secret rotation

A `/dashboard/secrets` nem tárol titkos értékeket. Csak azt jelzi, mely környezeti változók vannak konfigurálva, és mikor kell rotálni őket.

## 6. SLO és monitoring

A `/dashboard/observability` oldalon állíts be legalább buyer lead flow, agent demo flow és seller portal flow synthetic journey-t.

## 7. Go / No-Go döntés

A `/dashboard/v12-readiness` a végső command center. Pilot esetén 70% felett elfogadható, productionnél cél a 88%+ és nulla kritikus blocker.
