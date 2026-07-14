# Spatial Worker Contract

The worker receives listing-scoped media inputs and returns scene assets plus quality metrics.

## Job input

```json
{
  "listing": { "id": "...", "title": "...", "city": "..." },
  "assets": [{ "id": "...", "type": "IMAGE|VIDEO|PANORAMA_360", "url": "...", "roomLabel": "living_room" }],
  "requirements": {
    "outputFormats": ["splat", "ksplat", "ply", "previewImage", "manifest"],
    "floorplanLinking": true,
    "disclosure": "AI generated 3D reconstruction preview..."
  }
}
```

## Expected output

```json
{
  "formats": {
    "splatUrl": "https://cdn/.../scene.splat",
    "plyUrl": "https://cdn/.../scene.ply",
    "ksplatUrl": "https://cdn/.../scene.ksplat",
    "previewImageUrl": "https://cdn/.../preview.jpg"
  },
  "quality": {
    "geometryScore": 74,
    "textureScore": 79,
    "coverageScore": 68,
    "viewerScore": 86,
    "overallScore": 77
  },
  "disclosure": "AI generated 3D reconstruction preview. Verify geometry before publication."
}
```

## Worker modes

- `mock`: local simulation only
- `dry_run`: validates inputs and produces placeholder output
- `live`: calls the real external worker / GPU pipeline
