# 3D Reconstruction Execution Contract

V18 introduces a concrete reconstruction dispatch contract at `/api/3d/reconstruction/dispatch`.

The payload contains:

- listing facts
- image/video/360/floorplan input bundle
- reconstruction settings
- acceptance criteria
- provider routing status
- compliance rules
- checksum

Recommended flow:

1. Agent captures guided media.
2. EstatePilot creates a V18 dispatch payload.
3. Worker/provider returns scene files and quality metrics.
4. EstatePilot validates the manifest.
5. Human reviews geometry and disclosure.
6. Public viewer can be published.

Core artifact outputs:

- `scene.ksplat`
- `scene.splat`
- `scene.ply`
- `preview.jpg`
- `manifest.json`
- `quality.json`
