# V13 Next Steps

## Highest priority

1. Run `npm install` locally.
2. Run `npm run db:push`.
3. Run `npm run db:seed`.
4. Run `npm run release:v13-check`.
5. Fix all build/type/schema issues.
6. Deploy a staging environment.

## Provider activation order

1. Auth provider.
2. PostgreSQL production DB.
3. Cloudflare R2/S3 uploads.
4. OpenAI text + vision.
5. Resend email.
6. Sentry/PostHog.
7. Billing provider.
8. Google Calendar.

## Pilot launch

After staging works, create one real listing and run the pilot runbook. Do not sell it as a fully automated SaaS until the release gate passes with real providers, not mock providers.
