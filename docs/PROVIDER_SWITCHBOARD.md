# Provider Switchboard

V14 introduces a live-provider adapter view. The app can still run in demo mode, but each critical provider is evaluated with missing env keys and a fallback mode.

Critical adapters:

- `auth.session` → Clerk/Auth.js
- `ai.vision_text` → OpenAI
- `storage.media` → Cloudflare R2/S3
- `email.transactional` → Resend
- `billing.checkout` → Stripe/Barion
- `calendar.booking` → Google Calendar
- `monitoring.runtime` → Sentry/PostHog

Dashboard:

```text
/dashboard/adapters
```

API:

```text
GET /api/adapters/production
POST /api/adapters/production
```
