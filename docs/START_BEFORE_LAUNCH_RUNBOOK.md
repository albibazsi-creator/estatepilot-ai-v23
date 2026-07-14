# Start-before-launch runbook

## Minimum pilot command sequence

```bash
npm run release:v21-check
npm install
npm run db:push
npm run db:seed
npm run typecheck
npm run build
npm run dev
```

## Mandatory live providers before the first paid pilot

- Auth: Clerk or Auth.js, not dev auth.
- Storage: Cloudflare R2 or S3, not local-only uploads.
- AI: OpenAI API key with both text and vision model configured.
- Email: Resend sender verified.
- Monitoring: Sentry and PostHog or equivalent.

## Allowed pilot fallbacks

- Billing may start as manual invoice for the first pilot, if documented.
- Google Calendar may start as ICS export for the first pilot, if documented.
- 3D reconstruction may run dry-run or external-provider manual mode, if the listing clearly discloses the preview status.
