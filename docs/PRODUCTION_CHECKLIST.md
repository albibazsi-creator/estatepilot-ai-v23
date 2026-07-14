# Production checklist

## Must do before paid customers

- [ ] Replace demo auth with Clerk/Auth.js
- [ ] Add agency/team invitation flow
- [ ] Add R2/S3 presigned uploads
- [ ] Add upload virus/mime validation at edge
- [ ] Add real OpenAI vision/image input for publicly reachable images
- [ ] Add BullMQ + Redis workers
- [ ] Add CRON jobs for daily manager and weekly seller reports
- [ ] Add Resend verified domain
- [ ] Add HTML-to-PDF renderer for seller reports
- [ ] Add Stripe or Barion checkout
- [ ] Add Számlázz.hu invoice integration
- [ ] Add PostHog/Plausible tracking
- [ ] Add GDPR/ÁSZF/Felelős AI disclosure pages
- [ ] Add monitoring: Sentry, uptime, logs
- [ ] Add backup policy for Postgres and storage
- [ ] Add automated tests for lead scoring and report generation

## Nice to have

- [ ] Google Calendar / Outlook booking
- [ ] real 360 hotspot editor
- [ ] image staging provider integration
- [ ] owner approval workflow
- [ ] multi-language HU/EN/DE listing generator
- [ ] agency branding customization
- [ ] API keys for portal integrations
