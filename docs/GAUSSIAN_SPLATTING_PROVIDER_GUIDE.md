# Gaussian Splatting Provider Guide

A V16 provider adapter célja, hogy bármely külső 3DGS szolgáltatás vagy saját GPU worker beköthető legyen.

## Szükséges env változók

- `GAUSSIAN_SPLAT_WORKER_URL`
- `GAUSSIAN_SPLAT_WORKER_TOKEN`
- `SPATIAL_ASSET_BUCKET`
- `SPATIAL_ASSET_CDN_URL`

## Javasolt job contract

Input:

```json
{
  "listingId": "...",
  "assets": [
    { "type": "video", "url": "private-signed-url" },
    { "type": "image", "url": "private-signed-url" }
  ],
  "outputFormats": ["splat", "ply", "ksplat", "preview_image"],
  "qualityTarget": "pilot_demo"
}
```

Output:

```json
{
  "status": "completed",
  "splatUrl": "https://cdn.example.com/scene.splat",
  "plyUrl": "https://cdn.example.com/scene.ply",
  "ksplatUrl": "https://cdn.example.com/scene.ksplat",
  "previewImageUrl": "https://cdn.example.com/preview.jpg",
  "quality": {
    "coverage": 82,
    "blurRisk": "low",
    "geometryConfidence": 74
  }
}
```

## Első production lépés

Először ne saját GPU infrastruktúrával indulj. Érdemes külső provider dry-runnal bizonyítani, hogy van fizetőképes igény a 3D élményre.
