# V9 Release Notes — White-label, Localization & Partner API Hardening

V9 moves the product closer to an agency-ready SaaS package instead of a single-listing demo.

## Added

- White-label brand center
- White-label domain verification model
- HU/EN/DE listing translation model and generator endpoint
- Buyer persona + buyer match scoring model
- AI chat guardrail rule/event ledger
- Partner API v2 contract and request logs
- Partner lead creation endpoint with GDPR requirement
- Support desk and SLA incident models
- Onboarding checklist model
- Market digest snapshot model
- Brand audit and partner contract scripts

## New dashboard pages

- `/dashboard/branding`
- `/dashboard/translations`
- `/dashboard/buyer-intel`
- `/dashboard/guardrails`
- `/dashboard/partner-api`
- `/dashboard/support`
- `/dashboard/sla`

## New release command

```bash
npm run release:v9-check
```

## Still required before production

- Real auth provider
- Real OpenAI/R2/Stripe/Barion/Resend credentials
- Full build and E2E run
- Prisma migration review
- Partner API auth enforcement beyond demo mode
