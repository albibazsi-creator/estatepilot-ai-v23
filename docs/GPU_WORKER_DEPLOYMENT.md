# GPU Worker Deployment Guide

The Next.js app should not run heavy 3D reconstruction directly. A separate worker should run on a GPU environment.

## Required env

- `SPATIAL_QUEUE_URL`
- `SPATIAL_ARTIFACT_BUCKET`
- `SPATIAL_ARTIFACT_CDN_URL`
- `SPATIAL_GPU_WORKER_IMAGE`
- `SPATIAL_WEBHOOK_SECRET`

## Pilot options

- RunPod / Modal GPU worker for fast pilot validation
- external 3D reconstruction API while internal worker is being built
- AWS Batch / ECS GPU for enterprise-grade later deployment

## Worker skeleton

See `workers/spatial-gpu` and `docker-compose.gpu.yml`.
