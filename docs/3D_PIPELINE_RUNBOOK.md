# 3D Pipeline Runbook

## Ajánlott MVP útvonal

1. Agent létrehoz egy listinget.
2. Feltölt legalább 6–12 jó minőségű fotót.
3. Feltölt alaprajzot.
4. Megad Matterport/iframe linket vagy 360 panorámákat.
5. A rendszer lefuttatja a Digital Twin Readiness auditot.
6. Ha a coverage elég jó, mehet a saját 360 viewer / külső 3D provider dry-run.

## Gaussian Splatting V1 útvonal

1. Lassú walkthrough videó + átfedő fotók feltöltése.
2. `SpatialProcessingJob` létrehozása `jobType = gaussian_splat_reconstruction` értékkel.
3. Külső worker/API lekéri az input asseteket.
4. Worker output: `.splat`, `.ply`, `.ksplat`, preview image, quality metrics.
5. Output `GaussianSplatScene` rekordba kerül.
6. Public listing oldalon viewer embed vagy saját WebGL viewer jelenik meg.

## Compliance

- Minden AI/3D rekonstrukció preview jelölést kap.
- Eredeti fotók megmaradnak.
- A geometriát publikálás előtt embernek jóvá kell hagynia.
- Nem állítható olyan extra, ami az eredeti inputból nem bizonyított.
