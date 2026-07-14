# V21 Release Notes — Start-before-launch hardening

V21 closes the six most important gaps before an American-level pilot launch. It does not add random menu items; it converts V20 test-ready into a more launch-controlled package.

## Added

- V21 Start Readiness Center: `/dashboard/v21-start`
- Start Hardening Center: `/dashboard/start-hardening`
- Live AI Wiring Center: `/dashboard/live-ai`
- Live 3D Provider Bridge: `/dashboard/live-3d`
- Premium Demo Flow: `/dashboard/premium-demo`
- Live CRM Automation: `/dashboard/live-crm`
- Integration Launch Matrix: `/dashboard/integration-launch`
- API endpoints for every V21 start-before-launch layer
- No-dependency V21 artifact check: `npm run release:v21-check`

## The six gaps covered

1. Stable build and runtime hardening.
2. Live OpenAI / multimodal AI wiring.
3. Live 3D / digital twin provider bridge.
4. Premium Zillow-style demo experience.
5. CRM + AI sales automation loop.
6. Launch integration matrix for auth, storage, email, calendar, billing and monitoring.

## Still not claimed

V21 is not claimed production-ready until `npm install`, Prisma push/seed, TypeScript check, Next build, and manual core-flow smoke test all pass on the target machine.
