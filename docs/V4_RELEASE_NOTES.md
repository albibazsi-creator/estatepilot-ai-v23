# EstatePilot AI MVP v4 release notes

This round moves the project from a listing demo toward a real estate sales operating system.

## Added

- Marketing campaign center
- AI campaign generation endpoint
- Export package JSON per listing
- Follow-up task engine
- Auto follow-up task creation from new public leads
- Calendar slot model and dashboard
- ICS export for viewing slots
- Integration registry page
- Onboarding playbook page
- Property knowledge-base helper
- Public property chat persistence through chat sessions/messages
- New AI job types:
  - `generate_campaign_plan`
  - `create_followup_tasks`
  - `rebuild_property_knowledge`
- Seed data for campaigns, tasks, slots and integrations
- Smoke-check script

## Still required for production

- Real Auth.js/Clerk session replacement for the dev stub
- Cloudflare R2/S3 signed upload implementation
- Production email sender and templates
- Real payment provider checkout flow
- PDF renderer for seller reports
- Google Calendar OAuth sync
- Test suite and CI build check
- Production deploy and monitoring
