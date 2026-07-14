# V17 Release Notes — Spatial Worker Execution Layer

V17 upgrades the previous 3D/digital-twin preparation into an executable processing layer. It does not claim to include a full proprietary GPU reconstruction engine, but it now contains the production-facing contracts needed to connect one.

## Added

- Spatial worker health and dispatch contract
- 3D processing job creation endpoint
- Worker simulation endpoint for dry-run demo
- Gaussian Splatting scene registry improvements
- Scene manifest model and manifest endpoint
- Quality metrics and publish gate model
- Public `/spatial/[sceneId]` viewer shell
- Viewer adapter registry for EstatePilot WebGL, SuperSplat/PlayCanvas and Matterport fallback
- V17 readiness dashboard and checks

## Main routes

- `/dashboard/v17-readiness`
- `/dashboard/3d-worker`
- `/dashboard/3d-scenes`
- `/dashboard/3d-quality`
- `/dashboard/3d-viewer-adapters`
- `/spatial/[sceneId]`

## Main APIs

- `GET /api/3d/worker/health`
- `GET /api/3d/jobs`
- `POST /api/3d/jobs`
- `GET /api/3d/jobs/[id]`
- `POST /api/3d/jobs/[id]/simulate`
- `GET /api/3d/scenes`
- `GET /api/3d/scenes/[id]/manifest`
- `GET /api/3d/quality`
- `GET /api/3d/viewer-adapters`
- `GET /api/ops/v17-readiness`
