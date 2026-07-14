# EstatePilot AI — Architecture v3

## Product scope

This repository is a production-shaped MVP for an AI Real Estate Experience OS:

1. agent dashboard
2. property/listing CMS
3. media upload and analysis
4. AI copy/content workflows
5. 360/Matterport tour support
6. public listing pages
7. lead capture and scoring
8. appointment requests
9. seller reports
10. AI job queue and admin observability

## Main modules

### Dashboard

- `/dashboard` overview
- `/dashboard/daily` AI manager priorities
- `/dashboard/listings` listing CRUD
- `/dashboard/leads` CRM leads
- `/dashboard/appointments` viewing requests
- `/dashboard/reports` seller reports
- `/dashboard/automation` AI job queue
- `/admin` SaaS admin overview

### Public experience

- `/listing/[slug]` public property landing page
- `/seller/[token]` owner report portal

### API

- `/api/listings` listing CRUD
- `/api/listings/:id/media/upload` local upload adapter
- `/api/listings/:id/media/analyze` AI vision workflow
- `/api/listings/:id/ai/*` AI content endpoints
- `/api/public/listings/:slug/lead` public lead capture
- `/api/public/listings/:slug/chat` property-scoped AI chat
- `/api/public/listings/:slug/book` appointment request
- `/api/jobs` AI job queue
- `/api/jobs/process` synchronous MVP job runner
- `/api/health` deployment health check
- `/api/billing/webhook` billing webhook event storage

## Data model upgrades in v3

The Prisma schema now supports:

- AI jobs
- notification logs
- webhook events
- API keys
- richer listing facts
- storage metadata
- GDPR consent fields
- seller report share tokens
- AI readiness score

## AI workflow design

For MVP, jobs run synchronously through `/api/jobs/process`. In production, replace this with:

- BullMQ + Redis worker
- scheduled CRON for daily manager and weekly seller reports
- retry/dead-letter queue
- job-level token/cost tracking

Current job types:

- `analyze_images`
- `generate_listing_bundle`
- `generate_seller_report`
- `recalculate_leads`
- `daily_manager`
- `staging_plan`

## Storage design

The app uses a local adapter by default:

- files are saved under `public/uploads/listings/:listingId`
- database stores `storageProvider`, `storageKey`, `fileSizeBytes`, `mimeType`

The model is ready for R2/S3. Production next step:

1. install AWS SDK or S3-compatible client
2. add presigned upload endpoint
3. move uploads from Next server to object storage
4. serve through Cloudflare CDN

## Security / compliance

Implemented foundations:

- agency-scoped queries in critical write endpoints
- public rate limiting for lead/chat/book/event endpoints
- notification logs
- audit logs
- HTML escaping for report/email content
- GDPR consent timestamp/source
- security headers in `next.config.ts`

Production next step:

- Clerk/Auth.js session auth
- real RBAC middleware
- CSRF strategy for server actions
- signed owner report URLs / expiry
- DPA/GDPR policy pages
- file virus scanning
- stricter iframe allowlist for tour embeds

## Known MVP limitations

- no real Clerk/Auth.js yet, dev user comes from `DEFAULT_AGENT_EMAIL`
- AI runs mock mode unless `OPENAI_API_KEY` is set
- R2/S3 adapter is designed but not installed
- PDF export is HTML export, not binary PDF yet
- Google Calendar is not connected yet
- Stripe/Barion checkout is placeholder
