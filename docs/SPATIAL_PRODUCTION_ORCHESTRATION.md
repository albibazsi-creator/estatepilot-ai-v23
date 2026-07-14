# Spatial Production Orchestration

The V19 orchestrator tracks the complete path from capture to published 3D viewer.

1. Dataset version lock
2. Preflight validation
3. Provider or GPU dispatch
4. Reconstruction execution
5. Artifact upload and scene manifest
6. Human QA / compliance review
7. Tenant-safe viewer deployment

The orchestrator intentionally supports dry-run and live-candidate modes so the pilot can be sold before the internal GPU worker is fully hardened.
