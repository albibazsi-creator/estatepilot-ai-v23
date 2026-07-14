# Developer Handoff — EstatePilot AI

## Cél

Egy production felé húzott proptech SaaS MVP: ingatlan feltöltés, AI listing, landing oldal, 360/tour, lead capture, lead scoring, seller report, kampány, export, compliance és sales workflow.

## Első futtatás

```bash
cp .env.example .env
# állítsd be legalább: DATABASE_URL, NEXT_PUBLIC_APP_URL
npm install
npm run db:push
npm run db:seed
npm run release:deep-check
npm run dev
```

## Demo belépés

A jelenlegi auth még dev stub: `DEFAULT_AGENT_EMAIL=demo@estatepilot.ai`. Élesítéskor Clerk/Auth.js sessionre kell cserélni a `lib/current-user.ts` belsejét.

## Production prioritás

1. Dependency install + build/type hibák javítása.
2. PostgreSQL migráció éles környezetben.
3. Clerk/Auth.js bevezetése.
4. Cloudflare R2/S3 presigned upload adapter.
5. OpenAI Vision + text JSON schema validálás.
6. Resend email küldés.
7. Stripe/Barion checkout és webhook ellenőrzés.
8. PDF export Playwright/Puppeteerrel.
9. Google Calendar OAuth token exchange.
10. Sentry + PostHog.

## Minőségkapuk

- `npm run static:audit`
- `npm run routes:inventory`
- `npm run prisma:validate`
- `npm run typecheck`
- `npm run smoke`
- `GET /api/ops/readiness`
- Dashboard: `/dashboard/ops`, `/dashboard/quality`, `/dashboard/compliance`

## Amit tilos élesben így hagyni

- Dev auth stub.
- Local file storage.
- Mock AI outputs.
- Manual checkout mint egyetlen fizetési mód.
- Localhost app URL.
- Publikus POST route rate limit nélkül.
