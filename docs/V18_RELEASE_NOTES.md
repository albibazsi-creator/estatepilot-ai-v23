# V18 Release Notes — Highest-Level 3D Execution Layer

V18 focuses on the highest-value missing piece of the product: turning the 3D/digital-twin idea from a roadmap item into a concrete execution contract.

## Added

- V18 Digital Twin / Gaussian Splatting Readiness Center
- Reconstruction dispatch payload for external 3D providers or a GPU worker
- Strict scene manifest validator
- Room graph draft from media labels, tour hotspots and fallback room sequence
- 3D pilot acceptance pack
- GPU worker deployment plan
- Worker skeleton in `workers/spatial-gpu`
- `docker-compose.gpu.yml` for a future GPU deployment environment

## What this does not claim

This does not magically include a full proprietary Matterport-level reconstruction engine. It gives the app the architecture, API contract, worker skeleton, artifact contract, manifest gate and acceptance criteria needed to connect one safely.
