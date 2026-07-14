# V17 Next Steps

1. Run `npm install && npm run db:push && npm run db:seed` locally.
2. Run `npm run release:v17-check`.
3. Create a spatial processing job with `POST /api/3d/jobs`.
4. Run `POST /api/3d/jobs/[id]/simulate` to generate a dry-run scene.
5. Open `/dashboard/3d-scenes` and `/spatial/[sceneId]`.
6. Replace simulation with a real provider by setting:
   - `SPATIAL_WORKER_MODE=live`
   - `SPATIAL_WORKER_BASE_URL`
   - `SPATIAL_WORKER_TOKEN`
   - `SPATIAL_WEBHOOK_SECRET`
   - `SPATIAL_SCENE_CDN_BASE_URL`
7. Replace the placeholder viewer shell with a real WebGL splat renderer.
