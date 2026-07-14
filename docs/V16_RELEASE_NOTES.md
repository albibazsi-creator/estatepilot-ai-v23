# V16 Release Notes — 3D / Digital Twin Upgrade

A V16 kör célja nem újabb általános dashboard modulok hozzáadása volt, hanem a projekt eredeti 3D / 360 / digital twin víziójának komolyabb technikai előkészítése.

## Új fő képességek

- Guided 3D capture workflow fotóhoz, videóhoz és 360 panorámához
- 3D provider matrix külső rekonstrukciós API-hoz és Gaussian Splatting workerhez
- Digital Twin Readiness audit listing szinten
- Spatial Pipeline Center: capture → validation → reconstruction → viewer → compliance
- 360 / video / floorplan asset registry
- V16 readiness score, amely a V14 core pilot flow-t kombinálja a 3D/digital twin állapottal

## Új dashboard oldalak

- `/dashboard/v16-readiness`
- `/dashboard/3d-capture`
- `/dashboard/3d-pipeline`
- `/dashboard/digital-twins`
- `/dashboard/spatial-assets`

## Új API-k

- `GET /api/3d/providers`
- `GET /api/3d/pipeline`
- `GET /api/3d/readiness`
- `POST /api/3d/readiness`
- `POST /api/3d/capture/plan`
- `GET /api/ops/v16-readiness`

## Új Prisma modellek

- `ThreeDProviderConfig`
- `ThreeDCaptureSession`
- `ThreeDAsset`
- `SpatialProcessingJob`
- `GaussianSplatScene`
- `RoomGraphEdgeV16`
- `MobileCaptureChecklistItem`
- `DigitalTwinReadinessRun`

## Fontos állapot

A V16 még nem saját, teljes GPU-s Gaussian Splatting pipeline. Ehelyett production-ready szerződést, adatmodellt, auditot, provider kapcsolási pontot és UI-t ad hozzá. A következő nagy lépés egy választott 3D provider vagy saját worker tényleges bekötése.
