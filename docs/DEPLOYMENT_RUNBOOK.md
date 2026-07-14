# Deployment runbook

## 1. Lokális ellenőrzés

```bash
npm install
npm run prisma:validate
npm run typecheck
npm run db:push
npm run db:seed
npm run smoke
npm run dev
```

## 2. Kötelező production env változók

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `STORAGE_DRIVER`
- R2/S3 kulcsok
- Clerk/Auth.js secret értékek, ha auth cserélve lett

## 3. Vercel deploy irány

1. PostgreSQL létrehozása Supabase / Neon / Railway alatt.
2. `DATABASE_URL` felvétele Vercelben.
3. Build command: `npm run build`.
4. Post-deploy: `npx prisma db push` vagy migrációs pipeline.
5. Seed csak demo környezetben.

## 4. Élesítés előtti blokkolók

- valódi auth/session provider
- agency scoped RBAC minden route-on
- R2/S3 presigned upload
- Redis rate limit + BullMQ worker
- OpenAI vision tényleges képelemzés
- PDF render service seller reporthoz
- fizetés: Stripe/Barion
- monitoring: Sentry + PostHog


## v6 release check

Deploy előtt futtasd:

```bash
npm run release:check
```

A `/dashboard/ops` oldalon nézd végig a Production Doctor pontokat. Error státusszal ne menj élesbe. Warn státusszal csak belső demo menjen.
