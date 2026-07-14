# EstatePilot AI API surface v4

## Listings

- `GET /api/listings`
- `POST /api/listings`
- `GET /api/listings/:id`
- `PATCH /api/listings/:id`
- `DELETE /api/listings/:id`
- `POST /api/listings/:id/publish`
- `GET /api/listings/:id/export-package`

## Media / tour / AI

- `POST /api/listings/:id/media/upload`
- `POST /api/listings/:id/media/analyze`
- `POST /api/listings/:id/tours`
- `POST /api/tours/:tourId/nodes`
- `POST /api/tours/:tourId/hotspots`
- `POST /api/listings/:id/ai/generate-description`
- `POST /api/listings/:id/ai/generate-social-posts`
- `POST /api/listings/:id/ai/generate-reels-script`
- `POST /api/listings/:id/ai/generate-faq`
- `POST /api/listings/:id/ai/generate-staging-plan`
- `POST /api/listings/:id/ai/analyze-listing-score`

## Campaigns

- `POST /api/listings/:id/campaigns/generate`
- `GET /api/campaigns/:id`
- `PATCH /api/campaigns/:id`

## Public listing

- `GET /api/public/listings/:slug`
- `POST /api/public/listings/:slug/events`
- `POST /api/public/listings/:slug/chat`
- `POST /api/public/listings/:slug/lead`
- `POST /api/public/listings/:slug/book`

## Lead operations

- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `POST /api/leads/:id/follow-up`
- `POST /api/leads/:id/recalculate-score`

## Follow-up tasks

- `GET /api/follow-ups`
- `POST /api/follow-ups`
- `PATCH /api/follow-ups/:id`
- `DELETE /api/follow-ups/:id`

## Calendar

- `GET /api/calendar/slots`
- `POST /api/calendar/slots`
- `GET /api/calendar/slots/:id` returns `.ics`
- `PATCH /api/calendar/slots/:id`
- `DELETE /api/calendar/slots/:id`

## Reports / notifications

- `POST /api/listings/:id/reports/generate`
- `GET /api/listings/:id/reports`
- `GET /api/reports/:id/export`
- `POST /api/reports/:id/send`

## Automation

- `GET /api/jobs`
- `POST /api/jobs`
- `POST /api/jobs/process`

## Integrations / billing / health

- `GET /api/integrations`
- `POST /api/integrations`
- `GET /api/billing/subscription`
- `POST /api/billing/checkout`
- `POST /api/billing/webhook`
- `GET /api/health`


## v5 partner API

- `GET /api/partner/listings` — API key protected listing feed. Required scope: `listings:read`. Header: `Authorization: Bearer <api_key>`.
