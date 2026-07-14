import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getDigitalTwinReadiness, getSpatialProviderMatrix } from "@/lib/spatial-3d";

type LooseModel = {
  findMany?: (args?: unknown) => Promise<unknown[]>;
  findFirst?: (args?: unknown) => Promise<unknown | null>;
  findUnique?: (args?: unknown) => Promise<unknown | null>;
  count?: (args?: unknown) => Promise<number>;
  create?: (args: unknown) => Promise<unknown>;
  update?: (args: unknown) => Promise<unknown>;
  upsert?: (args: unknown) => Promise<unknown>;
};

function dbModel(name: string): LooseModel {
  return (prisma as unknown as Record<string, LooseModel>)[name] ?? {};
}

function envPresent(key: string) {
  const value = process.env[key];
  return Boolean(value && value.trim().length > 0);
}

function checksum(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 24);
}

export type V17Status = "live" | "dry_run" | "mock" | "blocked";

export function getSpatialWorkerConfig() {
  const requiredEnv = ["SPATIAL_WORKER_BASE_URL", "SPATIAL_WORKER_TOKEN", "SPATIAL_WEBHOOK_SECRET"];
  const missingEnv = requiredEnv.filter((key) => !envPresent(key));
  const mode = process.env.SPATIAL_WORKER_MODE ?? (missingEnv.length ? "mock" : "live");
  const simulationEnabled = process.env.ENABLE_SPATIAL_WORKER_SIMULATION !== "false";
  const status: V17Status = missingEnv.length === 0 ? "live" : simulationEnabled ? "mock" : "blocked";
  return {
    workerKey: "estatepilot_spatial_worker",
    displayName: "EstatePilot Spatial Worker",
    mode,
    status,
    baseUrl: process.env.SPATIAL_WORKER_BASE_URL || "mock://spatial-worker",
    requiredEnv,
    missingEnv,
    capabilities: [
      "input asset validation",
      "Gaussian Splatting job dispatch",
      "provider dry-run simulation",
      "scene manifest generation",
      "quality gate calculation",
      ".splat/.ply/.ksplat viewer handoff",
      "webhook completion contract"
    ],
    limits: {
      maxInputAssets: Number(process.env.SPATIAL_MAX_INPUT_ASSETS ?? 250),
      maxVideoMinutes: Number(process.env.SPATIAL_MAX_VIDEO_MINUTES ?? 12),
      minimumQualityScore: Number(process.env.SPATIAL_QUALITY_MIN_SCORE ?? 72)
    }
  };
}

export function getViewerAdapters() {
  const publicViewer = process.env.ENABLE_SPATIAL_PUBLIC_VIEWER !== "false";
  const cdnMissing = ["SPATIAL_SCENE_CDN_BASE_URL"].filter((key) => !envPresent(key));
  return [
    {
      adapterKey: "estatepilot_splat_viewer",
      displayName: "EstatePilot WebGL Splat Viewer",
      status: publicViewer ? "dry_run" : "blocked",
      supportedFormats: ["splat", "ksplat", "ply", "json-manifest"],
      embedMode: "next_public_viewer",
      requiredEnv: ["SPATIAL_VIEWER_BASE_URL"],
      missingEnv: ["SPATIAL_VIEWER_BASE_URL"].filter((key) => !envPresent(key)),
      notes: "V17-ben saját publikus viewer shell és manifest contract. A tényleges WebGL renderer cserélhető." 
    },
    {
      adapterKey: "supersplat_embed",
      displayName: "SuperSplat / PlayCanvas compatible embed",
      status: cdnMissing.length ? "mock" : "dry_run",
      supportedFormats: ["ply", "splat"],
      embedMode: "external_iframe",
      requiredEnv: ["SPATIAL_SCENE_CDN_BASE_URL"],
      missingEnv: cdnMissing,
      notes: "Külső viewer opció nagy jelenetfájlokhoz és gyors sales demóhoz."
    },
    {
      adapterKey: "matterport_fallback",
      displayName: "Matterport / external tour fallback",
      status: "live",
      supportedFormats: ["iframe", "matterport_url", "external_tour"],
      embedMode: "iframe",
      requiredEnv: [],
      missingEnv: [],
      notes: "Azonnal használható fallback addig is, amíg a 3DGS worker nincs live."
    }
  ];
}

export async function getSpatialWorkerHealth(agencyId: string) {
  const config = getSpatialWorkerConfig();
  const providers = getSpatialProviderMatrix();
  const viewerAdapters = getViewerAdapters();
  const jobModel = dbModel("spatialProcessingJob");
  const recentJobs = jobModel.findMany ? await jobModel.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 10 }) : [];
  const queued = recentJobs.filter((job) => String((job as Record<string, unknown>).status) === "queued").length;
  const running = recentJobs.filter((job) => String((job as Record<string, unknown>).status) === "running").length;
  const failed = recentJobs.filter((job) => String((job as Record<string, unknown>).status) === "failed").length;
  const score = config.status === "live" ? 90 : config.status === "mock" ? 58 : 35;
  return {
    ...config,
    score,
    providers: providers.map((provider) => ({ key: provider.providerKey, status: provider.status, missingEnv: provider.missingEnv })),
    viewerAdapters,
    queue: { recent: recentJobs.length, queued, running, failed },
    nextAction: config.missingEnv.length ? `Állítsd be: ${config.missingEnv.join(", ")}` : "Worker live dispatch bekapcsolható."
  };
}

export async function createSpatialProcessingJob(agencyId: string, listingId?: string) {
  const listing = listingId
    ? await prisma.listing.findFirst({ where: { agencyId, id: listingId }, include: { media: true, floorplans: true, tours: true } })
    : await prisma.listing.findFirst({ where: { agencyId }, include: { media: true, floorplans: true, tours: true }, orderBy: { createdAt: "desc" } });
  if (!listing) throw new Error("No listing found for spatial processing.");
  const media = listing.media ?? [];
  const images = media.filter((item) => item.mediaType === "IMAGE");
  const videos = media.filter((item) => item.mediaType === "VIDEO");
  const panoramas = media.filter((item) => item.mediaType === "PANORAMA_360");
  const worker = getSpatialWorkerConfig();
  const input = {
    listing: { id: listing.id, title: listing.title, city: listing.city, sizeM2: listing.sizeM2, rooms: listing.rooms },
    assets: media.map((item) => ({ id: item.id, type: item.mediaType, url: item.url, roomLabel: item.roomLabel, qualityScore: item.qualityScore })),
    requirements: {
      outputFormats: ["splat", "ksplat", "ply", "previewImage", "manifest"],
      floorplanLinking: listing.floorplans.length > 0,
      maxInputAssets: worker.limits.maxInputAssets,
      disclosure: "AI generated 3D reconstruction preview; geometry must be verified before publication."
    }
  };
  const warnings = [
    images.length < 16 ? "Kevés átfedő fotó 3D rekonstrukcióhoz." : null,
    videos.length < 1 ? "Nincs walkthrough videó." : null,
    panoramas.length < 1 ? "Nincs 360 panoráma fallback." : null
  ].filter(Boolean);
  const jobPayload = {
    agencyId,
    listingId: listing.id,
    providerKey: worker.workerKey,
    jobType: "gaussian_splat_reconstruction",
    status: worker.status === "live" ? "queued" : "dry_run_ready",
    priority: 80,
    inputJson: { ...input, warnings, workerMode: worker.mode, checksum: checksum(input) },
    progress: 0,
    costEstimateHuf: Math.max(9900, media.length * 350)
  };
  const jobModel = dbModel("spatialProcessingJob");
  const job = jobModel.create ? await jobModel.create({ data: jobPayload }) : { id: `mock-job-${Date.now()}`, ...jobPayload };
  const eventModel = dbModel("spatialProcessingEvent");
  if (eventModel.create) {
    await eventModel.create({ data: { agencyId, listingId: listing.id, processingJobId: (job as Record<string, unknown>).id, eventType: "job_created", status: "info", message: "V17 spatial processing job created.", payloadJson: { warnings, workerStatus: worker.status } } });
  }
  return { job, warnings, worker, inputChecksum: checksum(input) };
}

export async function simulateSpatialJobCompletion(agencyId: string, jobId: string) {
  const jobModel = dbModel("spatialProcessingJob");
  const existing = jobModel.findUnique ? await jobModel.findUnique({ where: { id: jobId } }) : null;
  const listingId = String((existing as Record<string, unknown> | null)?.listingId ?? "");
  const now = new Date();
  const output = {
    formats: {
      splatUrl: `${process.env.SPATIAL_SCENE_CDN_BASE_URL || "/mock-spatial"}/${jobId}/scene.splat`,
      plyUrl: `${process.env.SPATIAL_SCENE_CDN_BASE_URL || "/mock-spatial"}/${jobId}/scene.ply`,
      ksplatUrl: `${process.env.SPATIAL_SCENE_CDN_BASE_URL || "/mock-spatial"}/${jobId}/scene.ksplat`,
      previewImageUrl: `${process.env.SPATIAL_SCENE_CDN_BASE_URL || "/mock-spatial"}/${jobId}/preview.jpg`
    },
    quality: { geometryScore: 74, textureScore: 79, coverageScore: 68, viewerScore: 86, overallScore: 77 },
    generatedAt: now.toISOString(),
    disclosure: "AI generated 3D reconstruction preview. Verify dimensions and geometry before publication."
  };
  let updated: unknown = existing;
  if (jobModel.update && existing) {
    updated = await jobModel.update({ where: { id: jobId }, data: { status: "completed", progress: 100, outputJson: output, completedAt: now } });
  }
  const sceneModel = dbModel("gaussianSplatScene");
  const scene = sceneModel.create ? await sceneModel.create({ data: { agencyId, listingId: listingId || null, processingJobId: jobId, sceneName: `V17 scene ${jobId.slice(-6)}`, status: "ready_for_review", sourceType: "v17_worker_simulation", splatUrl: output.formats.splatUrl, plyUrl: output.formats.plyUrl, ksplatUrl: output.formats.ksplatUrl, viewerUrl: `${process.env.SPATIAL_VIEWER_BASE_URL || "/spatial"}/${jobId}`, previewImageUrl: output.formats.previewImageUrl, qualityJson: output.quality, disclosureText: output.disclosure } }) : { id: `mock-scene-${jobId}`, status: "ready_for_review", ...output };
  await createSceneManifest(agencyId, listingId || undefined, String((scene as Record<string, unknown>).id ?? jobId), output);
  await persistQualityMetrics(agencyId, listingId || undefined, jobId, String((scene as Record<string, unknown>).id ?? jobId), output.quality);
  const eventModel = dbModel("spatialProcessingEvent");
  if (eventModel.create) {
    await eventModel.create({ data: { agencyId, listingId: listingId || null, processingJobId: jobId, eventType: "job_completed", status: "success", message: "V17 spatial job completed in simulation mode.", payloadJson: output } });
  }
  return { job: updated, scene, output };
}

export async function createSceneManifest(agencyId: string, listingId: string | undefined, sceneId: string, output: Record<string, unknown>) {
  const manifest = {
    version: "v17",
    sceneId,
    listingId,
    createdAt: new Date().toISOString(),
    viewer: {
      adapter: "estatepilot_splat_viewer",
      publicUrl: `${process.env.SPATIAL_VIEWER_BASE_URL || "/spatial"}/${sceneId}`,
      fallbackAdapter: "matterport_fallback"
    },
    assets: output.formats ?? {},
    quality: output.quality ?? {},
    compliance: {
      disclosureRequired: true,
      disclosureText: output.disclosure,
      publishGate: "review_required",
      doNotUseForMeasurements: true,
      originalMediaMustRemainAvailable: true
    }
  };
  const manifestModel = dbModel("spatialSceneManifest");
  const checksumValue = checksum(manifest);
  return manifestModel.create
    ? manifestModel.create({ data: { agencyId, listingId, sceneId, status: "draft", viewerAdapterKey: "estatepilot_splat_viewer", manifestVersion: "v17", manifestJson: manifest, checksum: checksumValue, publishedUrl: manifest.viewer.publicUrl } })
    : { id: `mock-manifest-${sceneId}`, manifestJson: manifest, checksum: checksumValue };
}

export async function persistQualityMetrics(agencyId: string, listingId: string | undefined, processingJobId: string, sceneId: string, quality: Record<string, number>) {
  const metricModel = dbModel("spatialQualityMetric");
  const threshold = Number(process.env.SPATIAL_QUALITY_MIN_SCORE ?? 72);
  const entries = Object.entries(quality).map(([metricKey, value]) => ({
    agencyId,
    listingId,
    processingJobId,
    sceneId,
    metricKey,
    value,
    threshold: metricKey === "overallScore" ? threshold : 65,
    status: value >= (metricKey === "overallScore" ? threshold : 65) ? "passed" : "warning",
    evidenceJson: { generatedBy: "v17-simulation", threshold }
  }));
  if (metricModel.create) {
    for (const entry of entries) await metricModel.create({ data: entry });
  }
  return entries;
}

export async function getSpatialQualitySummary(agencyId: string) {
  const readiness = await getDigitalTwinReadiness(agencyId);
  const metricModel = dbModel("spatialQualityMetric");
  const metrics = metricModel.findMany ? await metricModel.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 30 }) : [];
  const values = metrics.map((item) => Number((item as Record<string, unknown>).value ?? 0)).filter(Number.isFinite);
  const avg = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : readiness.score;
  const warnings = metrics.filter((item) => String((item as Record<string, unknown>).status) !== "passed").length;
  return {
    score: avg,
    status: avg >= Number(process.env.SPATIAL_QUALITY_MIN_SCORE ?? 72) ? "quality_pass" : "review_required",
    metrics,
    warnings,
    readiness,
    gates: [
      { key: "geometry", label: "Geometria ellenőrzés", status: avg >= 70 ? "passed" : "warning", threshold: 70 },
      { key: "texture", label: "Textúra / vizuális minőség", status: avg >= 72 ? "passed" : "warning", threshold: 72 },
      { key: "coverage", label: "Szoba lefedettség", status: readiness.score >= 65 ? "passed" : "warning", threshold: 65 },
      { key: "disclosure", label: "AI 3D disclosure", status: "passed", threshold: 100 }
    ]
  };
}

export async function getSceneManifestSummary(agencyId: string) {
  const sceneModel = dbModel("gaussianSplatScene");
  const manifestModel = dbModel("spatialSceneManifest");
  const scenes = sceneModel.findMany ? await sceneModel.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 20 }) : [];
  const manifests = manifestModel.findMany ? await manifestModel.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 20 }) : [];
  const readyScenes = scenes.filter((scene) => ["ready_for_review", "published", "ready"].includes(String((scene as Record<string, unknown>).status))).length;
  const manifestCoverage = scenes.length ? Math.round((manifests.length / scenes.length) * 100) : 0;
  return { scenes, manifests, readyScenes, manifestCoverage, status: readyScenes > 0 ? "scene_ready" : "no_scene_yet" };
}

export async function getV17Readiness(agencyId: string) {
  const worker = await getSpatialWorkerHealth(agencyId);
  const quality = await getSpatialQualitySummary(agencyId);
  const scenes = await getSceneManifestSummary(agencyId);
  const v16 = await getDigitalTwinReadiness(agencyId);
  const checks = [
    { key: "worker", label: "3D worker dispatch réteg", score: worker.score, status: worker.status === "blocked" ? "failed" : worker.status === "live" ? "passed" : "warning", evidence: worker.nextAction },
    { key: "scene_manifest", label: "Scene manifest contract", score: scenes.manifestCoverage || (scenes.scenes.length ? 70 : 35), status: scenes.manifestCoverage > 0 ? "passed" : "warning", evidence: `${scenes.manifests.length} manifest / ${scenes.scenes.length} scene` },
    { key: "quality_gate", label: "3D quality gate", score: quality.score, status: quality.status === "quality_pass" ? "passed" : "warning", evidence: `${quality.warnings} quality warning` },
    { key: "viewer_adapters", label: "Viewer adapterek", score: getViewerAdapters().some((adapter) => adapter.status !== "blocked") ? 78 : 20, status: getViewerAdapters().some((adapter) => adapter.status !== "blocked") ? "passed" : "failed", evidence: getViewerAdapters().map((adapter) => `${adapter.adapterKey}:${adapter.status}`).join(", ") },
    { key: "v16_input", label: "V16 input coverage", score: v16.score, status: v16.score >= 70 ? "passed" : "warning", evidence: v16.status }
  ];
  const score = Math.round(checks.reduce((sum, item) => sum + item.score, 0) / checks.length);
  const failed = checks.filter((item) => item.status === "failed").length;
  const warnings = checks.filter((item) => item.status === "warning").length;
  const status = failed ? "blocked" : warnings ? "3d_pilot_ready_with_review" : "3d_pilot_ready";
  return { score, status, checks, worker, quality, scenes, v16, blockers: checks.filter((item) => item.status !== "passed").map((item) => `${item.label}: ${item.evidence}`) };
}
