# EstatePilot Spatial GPU Worker Skeleton

This folder documents the executable contract for the future Gaussian Splatting / digital twin worker.

The Next.js app dispatches a V18 payload from `/api/3d/reconstruction/dispatch`. A live worker should:

1. Fetch the input bundle images, walkthrough videos, 360 panoramas and floorplans.
2. Validate overlap, resolution, room labels and compliance metadata.
3. Run an external provider OR internal COLMAP/Nerfstudio/gsplat pipeline.
4. Upload `scene.ksplat`, `scene.splat`, `scene.ply`, `preview.jpg`, `manifest.json` and `quality.json` to R2/S3.
5. Call the EstatePilot webhook with status, artifact URLs, scene manifest and quality metrics.

This is intentionally a skeleton. The heavy GPU reconstruction engine should be connected as a separate service so the SaaS app stays lightweight and deployable on Vercel/Node.
