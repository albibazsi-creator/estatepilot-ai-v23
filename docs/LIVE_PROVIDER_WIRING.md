# Live provider wiring

## OpenAI

Required env:

- `OPENAI_API_KEY`
- `OPENAI_MODEL_TEXT`
- `OPENAI_MODEL_VISION`

Routes to test:

- `/api/listings/:id/ai/generate-description`
- `/api/listings/:id/ai/generate-social-posts`
- `/api/listings/:id/ai/generate-reels-script`
- `/api/public/listings/:slug/chat`

## Storage

Required env for R2/S3:

- `STORAGE_DRIVER`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `STORAGE_PUBLIC_BASE_URL`

## 3D worker

Required env:

- `SPATIAL_WORKER_URL`
- `SPATIAL_WORKER_TOKEN`
- `STORAGE_PUBLIC_BASE_URL`

Expected outputs:

- `scene.manifest.json`
- `.ksplat`
- `.splat`
- `.ply`
- `preview.jpg`
- `quality.json`
