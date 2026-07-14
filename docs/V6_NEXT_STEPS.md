# Következő élesítési lépések

## 1. Lokális futtatás

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Majd:

```bash
npm run release:check
```

## 2. Production env

Minimum:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_PROVIDER=clerk` vagy `authjs`
- `STORAGE_DRIVER=r2`
- `STORAGE_PUBLIC_BASE_URL`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## 3. Auth

`lib/current-user.ts` helyére valós session lookup kell.

Ajánlott:

- Clerk gyors MVP-hez
- Auth.js sajátabb kontrollhoz

## 4. Storage

`lib/upload-intent.ts` és `lib/storage.ts` cserélendő valódi R2/S3 adapterre:

- presigned PUT URL
- MIME whitelist
- size limit
- private bucket + public CDN
- thumbnail worker

## 5. AI

`lib/ai.ts` már provider-wrapperes. Következő:

- valódi image URL-ek küldése vision modellnek
- AI trace mentés minden művelethez
- token költség naplózás
- retry / timeout / fallback policy

## 6. Fizetés

`lib/billing.ts` provider skeleton.

Következő:

- Stripe Checkout Session
- Barion PaymentStart
- webhook signature ellenőrzés
- payment state machine
- Számlázz.hu számla generálás

## 7. PDF

`/api/reports/[id]/pdf` most HTML export.

Következő:

- Playwright HTML → PDF
- vagy managed PDF service
- seller email attachment

## 8. Deploy

Ajánlott stack:

- Vercel app
- Neon/Supabase Postgres
- Cloudflare R2
- Resend
- Sentry
- PostHog
