# Production Deployment — Vercel + Postgres + R2

## Ajánlott setup

- Vercel: Next.js app hosting.
- Neon/Supabase/Railway: PostgreSQL.
- Cloudflare R2: média storage.
- Resend: email.
- OpenAI: image analysis + copy generation.
- Sentry: error monitoring.
- PostHog/Plausible: analytics.

## Minimum env

- `DATABASE_URL`
- `DEFAULT_AGENT_EMAIL`
- `OPENAI_API_KEY`
- `STORAGE_DRIVER=r2`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `RESEND_API_KEY`
- `APP_URL`

## Deploy parancsok

```bash
npm install
npm run prisma:validate
npm run typecheck
npm run build
npx prisma db push
npm run db:seed
```

## Production gate

Élesítés előtt a `/dashboard/ops`, `/dashboard/handoff`, `/dashboard/quality`, `/dashboard/compliance` oldalak legyenek zöld/elfogadható állapotban.
