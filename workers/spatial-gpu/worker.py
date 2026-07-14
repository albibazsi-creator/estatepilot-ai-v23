"""Minimal GPU worker skeleton for EstatePilot V18.

This file is intentionally dependency-light. In production, wrap this with FastAPI/Celery/BullMQ worker glue
and call COLMAP/Nerfstudio/gsplat or a managed 3D provider.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def checksum(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()[:24]


def simulate(payload: dict) -> dict:
    request_id = payload.get("requestId", "spatial-demo")
    cdn = os.environ.get("SPATIAL_ARTIFACT_CDN_URL", "/mock-spatial")
    output = {
        "requestId": request_id,
        "status": "completed_dry_run",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "formats": {
            "ksplatUrl": f"{cdn}/{request_id}/scene.ksplat",
            "splatUrl": f"{cdn}/{request_id}/scene.splat",
            "plyUrl": f"{cdn}/{request_id}/scene.ply",
            "previewImageUrl": f"{cdn}/{request_id}/preview.jpg",
        },
        "quality": {
            "geometryScore": 76,
            "textureScore": 78,
            "coverageScore": 73,
            "viewerScore": 86,
            "overallScore": 78,
        },
        "disclosure": "AI generated 3D reconstruction preview. Verify geometry before publication.",
    }
    output["checksum"] = checksum(output)
    return output


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python worker.py workers/spatial-gpu/worker-contract.sample.json", file=sys.stderr)
        sys.exit(2)
    payload = json.loads(Path(sys.argv[1]).read_text())
    print(json.dumps(simulate(payload), indent=2))
