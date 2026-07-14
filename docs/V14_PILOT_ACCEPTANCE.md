# V14 Pilot Acceptance Criteria

The first paid pilot is acceptable only when:

- `npm run release:v14-check` completes locally
- `npm run build` completes locally
- Core Pilot Flow score is at least 80
- Auth, storage, AI and email adapters are live or intentionally accepted as pilot exceptions
- At least one end-to-end lead flow scenario has passed
- Launch Risk Register has no open critical risk except explicitly accepted build/dependency caveats
- Seller report can be exported and emailed

Not required for MVP pilot:

- Gaussian Splatting
- Full mobile capture app
- Full portal API integrations
- Fully automated billing, if pilot is invoiced manually
