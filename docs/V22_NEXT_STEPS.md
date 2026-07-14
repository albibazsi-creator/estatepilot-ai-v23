# V22 Next Steps

Recommended next action is not another feature wave. It is a hardening sprint:

```bash
npm run release:v22-check
npm install
npm run db:push
npm run db:seed
npm run typecheck
npm run build
npm run dev
```

Then configure live providers in this order:

1. OpenAI
2. Auth
3. R2/S3
4. Resend
5. Sentry/PostHog
6. Spatial worker/provider
7. Billing and Calendar after pilot proof
