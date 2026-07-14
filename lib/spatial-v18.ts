import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSpatialWorkerHealth, getSceneManifestSummary, getV17Readiness, getViewerAdapters } from "@/lib/spatial-v17";
import { getDigitalTwinReadiness, getSpatialProviderMatrix } from "@/lib/spatial-3d";

type LooseModel = {
  findMany?: (args?: unknown) => Promise<unknown[]>;
  findFirst?: (args?: unknown) => Promise<unknown | null>;
  findUnique?: (args?: unknown) => Promise<unknown | null>;
  create?: (args: unknown) => Promise<unknown>;
  update?: (args: unknown) => Promise<unknown>;
  upsert?: (args: unknown) => Promise<unknown>;
  count?: (args?: unknown) => Promise<number>;
};

type LooseRecord = Record<string, unknown>;

function dbModel(name: string): LooseModel {
  return (prisma as unknown as Record<string, LooseModel>)[name] ?? {};
}

function envPresent(key: string) {
  const value = process.env[key];
  return Boolean(value && value.trim().length > 0);
}

function sha(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function shortSha(input: unknown) {
  return sha(input).slice(0, 24);
}

function asArray(value: unknown): LooseRecord[] {
  return Array.isArray(value) ? value.filter((item): item is LooseRecord => typeof item === "object" && item !== null) : [];
}

function scoreStatus(score: number) {
  if (score >= 86) return "passed";
  if (score >= 64) return "warning";
  return "failed";
}

export function getGpuWorkerDeploymentPlan() {
  const requiredEnv = [
    "SPATIAL_QUEUE_URL",
    "SPATIAL_ARTIFACT_BUCKET",
    "SPATIAL_ARTIFACT_CDN_URL",
    "SPATIAL_GPU_WORKER_IMAGE",
    "SPATIAL_WEBHOOK_SECRET"
  ];
  const missingEnv = requiredEnv.filter((key) => !envPresent(key));
  const optionalEnv = ["SPATIAL_NERFSTUDIO_IMAGE", "SPATIAL_COLMAP_IMAGE", "SPATIAL_SUPERSPLAT_CLI", "SPATIAL_GPU_INSTANCE_TYPE"];
  const optionalMissing = optionalEnv.filter((key) => !envPresent(key));
  const status = missingEnv.length === 0 ? "deploy_ready" : missingEnv.length <= 2 ? "partial" : "mock_only";
  const score = Math.max(20, 100 - missingEnv.length * 14 - optionalMissing.length * 4);
  return {
    status,
    score,
    requiredEnv,
    missingEnv,
    optionalEnv,
    optionalMissing,
    recommendedStack: [
      "Next.js app dispatches job payload",
      "Redis/BullMQ or managed queue stores reconstruction jobs",
      "GPU worker pulls input bundle and runs COLMAP/Nerfstudio/gsplat pipeline or external provider",
      "Worker uploads .splat/.ksplat/.ply + preview + manifest to R2/S3",
      "Webhook updates SpatialProcessingJob, SpatialSceneManifest, SpatialQualityMetric and publish gate"
    ],
    deploymentTargets: [
      { key: "modal_or_runpod_gpu", label: "GPU worker pilot", mode: "recommended", why: "Fast pilot without buying servers." },
      { key: "aws_batch_gpu", label: "Enterprise batch", mode: "later", why: "Better governance for enterprise accounts." },
      { key: "external_3d_api", label: "External 3D provider", mode: "fallback", why: "Use while internal 3DGS pipeline is being hardened." }
    ],
    nextAction: missingEnv.length ? `Állítsd be ezeket az env kulcsokat: ${missingEnv.join(", ")}` : "GPU worker deploy contract készen áll dry-runról live módra váltáshoz."
  };
}

export async function getLatestSpatialListing(agencyId: string, listingId?: string) {
  if (listingId) {
    const listing = await prisma.listing.findFirst({
      where: { agencyId, id: listingId },
      include: { media: true, floorplans: true, tours: { include: { nodes: true, hotspots: true } }, aiOutputs: true, leads: true }
    });
    if (listing) return listing;
  }
  return prisma.listing.findFirst({
    where: { agencyId },
    include: { media: true, floorplans: true, tours: { include: { nodes: true, hotspots: true } }, aiOutputs: true, leads: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function buildReconstructionDispatchPayload(agencyId: string, listingId?: string) {
  const listing = await getLatestSpatialListing(agencyId, listingId);
  if (!listing) throw new Error("No listing available for V18 reconstruction dispatch.");

  const media = listing.media ?? [];
  const images = media.filter((item) => item.mediaType === "IMAGE");
  const videos = media.filter((item) => item.mediaType === "VIDEO");
  const panoramas = media.filter((item) => item.mediaType === "PANORAMA_360");
  const floorplans = listing.floorplans ?? [];
  const tours = listing.tours ?? [];
  const roomLabels = Array.from(new Set(media.map((item) => item.roomLabel).filter(Boolean)));
  const providerMatrix = getSpatialProviderMatrix();
  const worker = await getSpatialWorkerHealth(agencyId);
  const gpu = getGpuWorkerDeploymentPlan();

  const captureWarnings = [
    images.length < 24 ? "24+ átfedő fotó ajánlott a jobb 3D rekonstrukcióhoz." : null,
    videos.length < 1 ? "Legalább 1 lassú walkthrough videó kell a stabil pipeline-hoz." : null,
    roomLabels.length < 5 ? "Kevés szobacímke; a room graph pontossága gyengébb lehet." : null,
    floorplans.length < 1 ? "Nincs alaprajz; floorplan-linking csak később lesz pontos." : null
  ].filter((item): item is string => Boolean(item));

  const payload = {
    contractVersion: "estatepilot.spatial.reconstruction.v18",
    requestId: `spatial-${shortSha({ agencyId, listingId: listing.id, media: media.map((item) => item.id) })}`,
    agencyId,
    listingId: listing.id,
    createdAt: new Date().toISOString(),
    mode: gpu.status === "deploy_ready" && worker.status === "live" ? "live_dispatch_ready" : "dry_run",
    listing: {
      title: listing.title,
      city: listing.city,
      district: listing.district,
      price: listing.price,
      sizeM2: listing.sizeM2,
      rooms: listing.rooms
    },
    inputBundle: {
      images: images.map((item) => ({ id: item.id, url: item.url, roomLabel: item.roomLabel, qualityScore: item.qualityScore })),
      videos: videos.map((item) => ({ id: item.id, url: item.url, roomLabel: item.roomLabel })),
      panoramas: panoramas.map((item) => ({ id: item.id, url: item.url, roomLabel: item.roomLabel })),
      floorplans: floorplans.map((item) => ({ id: item.id, fileUrl: item.fileUrl, type: item.type })),
      tours: tours.map((tour) => ({ id: tour.id, type: tour.tourType, provider: tour.provider, embedUrl: tour.embedUrl }))
    },
    reconstructionSettings: {
      targetFormats: ["ksplat", "splat", "ply", "previewImage", "sceneManifest"],
      preferredPipeline: process.env.SPATIAL_PREFERRED_PIPELINE || "external_or_gsplat_worker",
      roomGraphRequired: true,
      floorplanLinkingRequired: floorplans.length > 0,
      maxProcessingMinutes: Number(process.env.SPATIAL_MAX_PROCESSING_MINUTES ?? 90),
      minimumQualityScore: Number(process.env.SPATIAL_QUALITY_MIN_SCORE ?? 72),
      publishRequiresHumanReview: true
    },
    acceptanceCriteria: {
      geometryScore: 72,
      textureScore: 72,
      coverageScore: 70,
      viewerScore: 80,
      manifestChecksumRequired: true,
      disclosureRequired: true,
      originalMediaRetained: true
    },
    providerRouting: {
      workerStatus: worker.status,
      gpuStatus: gpu.status,
      providers: providerMatrix.map((provider) => ({ key: provider.providerKey, status: provider.status, nextAction: provider.nextAction }))
    },
    compliance: {
      disclosure: "AI generated 3D reconstruction preview. Dimensions, geometry and condition must be verified before publication.",
      cannotHideDefects: true,
      cannotInventRoomsOrView: true,
      originalMediaMustStayAvailable: true
    },
    captureWarnings,
    checksum: ""
  };
  const signedPayload = { ...payload, checksum: shortSha(payload) };
  return signedPayload;
}

export async function createV18ReconstructionRun(agencyId: string, listingId?: string) {
  const payload = await buildReconstructionDispatchPayload(agencyId, listingId);
  const stagePlan = [
    { key: "input_bundle", label: "Input bundle validated", status: payload.captureWarnings.length ? "warning" : "ready" },
    { key: "provider_dispatch", label: "Provider/worker dispatch", status: payload.mode === "live_dispatch_ready" ? "ready" : "dry_run" },
    { key: "reconstruction", label: "COLMAP/Nerfstudio/gsplat/external reconstruction", status: "queued" },
    { key: "scene_manifest", label: "Scene manifest and artifact upload", status: "pending" },
    { key: "quality_gate", label: "Quality metrics + human review", status: "pending" },
    { key: "viewer_publish", label: "Public viewer publish gate", status: "pending" }
  ];

  const runPayload = {
    agencyId,
    listingId: payload.listingId,
    runKey: payload.requestId,
    status: payload.mode === "live_dispatch_ready" ? "ready_to_dispatch" : "dry_run_ready",
    providerKey: payload.providerRouting.providers.find((provider) => provider.status === "live")?.key ?? "estatepilot_spatial_worker",
    requestJson: payload,
    stagePlanJson: stagePlan,
    artifactPlanJson: {
      bucket: process.env.SPATIAL_ARTIFACT_BUCKET || "mock-spatial-bucket",
      cdnBaseUrl: process.env.SPATIAL_ARTIFACT_CDN_URL || "/mock-spatial",
      expectedFiles: ["scene.ksplat", "scene.splat", "scene.ply", "preview.jpg", "manifest.json", "quality.json"]
    },
    acceptanceJson: payload.acceptanceCriteria,
    estimatedCostHuf: Math.max(12900, payload.inputBundle.images.length * 320 + payload.inputBundle.videos.length * 2200)
  };

  const runModel = dbModel("spatialReconstructionRun");
  const run = runModel.create ? await runModel.create({ data: runPayload }) : { id: payload.requestId, ...runPayload };
  const eventModel = dbModel("spatialProcessingEvent");
  if (eventModel.create) {
    await eventModel.create({ data: { agencyId, listingId: payload.listingId, eventType: "v18_reconstruction_run_created", status: "info", message: "V18 reconstruction dispatch package created.", payloadJson: { runKey: payload.requestId, mode: payload.mode, warnings: payload.captureWarnings } } });
  }
  return { run, payload, stagePlan };
}

export type ManifestValidationInput = {
  manifestVersion?: string;
  sceneId?: string;
  formats?: Record<string, unknown>;
  quality?: Record<string, number>;
  disclosure?: string;
  checksum?: string;
  viewerAdapterKey?: string;
};

export async function validateSceneManifestStrict(agencyId: string, manifest?: ManifestValidationInput, listingId?: string) {
  const latestSummary = await getSceneManifestSummary(agencyId);
  const latestManifestRecord = latestSummary.manifests[0] as LooseRecord | undefined;
  const sourceManifest = manifest ?? ((latestManifestRecord?.manifestJson as ManifestValidationInput | undefined) || {
    manifestVersion: "v18-empty",
    sceneId: "missing-scene",
    formats: {},
    quality: {},
    disclosure: "",
    checksum: ""
  });
  const formats = sourceManifest.formats ?? {};
  const quality = sourceManifest.quality ?? {};
  const checks = [
    { key: "format_ksplat", label: "KSplat output", passed: Boolean(formats.ksplatUrl || formats.splatUrl), severity: "critical" },
    { key: "preview", label: "Preview image", passed: Boolean(formats.previewImageUrl), severity: "high" },
    { key: "quality_geometry", label: "Geometry score >= 72", passed: Number(quality.geometryScore ?? 0) >= 72, severity: "critical" },
    { key: "quality_texture", label: "Texture score >= 72", passed: Number(quality.textureScore ?? 0) >= 72, severity: "high" },
    { key: "quality_viewer", label: "Viewer score >= 80", passed: Number(quality.viewerScore ?? 0) >= 80, severity: "high" },
    { key: "disclosure", label: "AI 3D disclosure", passed: String(sourceManifest.disclosure ?? "").length > 24, severity: "critical" },
    { key: "checksum", label: "Manifest checksum", passed: Boolean(sourceManifest.checksum || latestManifestRecord?.checksum), severity: "normal" }
  ];
  const passed = checks.filter((check) => check.passed).length;
  const criticalFailed = checks.filter((check) => !check.passed && check.severity === "critical").length;
  const score = Math.round((passed / checks.length) * 100);
  const status = criticalFailed ? "blocked" : score >= 85 ? "publish_candidate" : "review_required";
  const validation = { status, score, checks, source: manifest ? "request_body" : "latest_scene_manifest", validatedAt: new Date().toISOString() };
  const model = dbModel("spatialManifestValidationRun");
  let run: unknown = null;
  if (model.create) {
    run = await model.create({
      data: {
        agencyId,
        listingId: listingId ?? null,
        sceneId: String(sourceManifest.sceneId ?? latestManifestRecord?.sceneId ?? "unknown"),
        status,
        score,
        checksJson: checks,
        manifestJson: sourceManifest,
        checksum: shortSha(sourceManifest),
        blockerJson: checks.filter((check) => !check.passed)
      }
    });
  }
  return { run, ...validation };
}

export async function buildRoomGraphDraft(agencyId: string, listingId?: string) {
  const listing = await getLatestSpatialListing(agencyId, listingId);
  if (!listing) throw new Error("No listing available for room graph draft.");
  const media = listing.media ?? [];
  const tours = listing.tours ?? [];
  const labels = Array.from(new Set(media.map((item) => item.roomLabel).filter(Boolean))) as string[];
  const defaultLabels = labels.length ? labels : ["Bejárat", "Folyosó", "Nappali", "Konyha", "Háló", "Fürdő"];
  const nodes = defaultLabels.map((label, index) => ({
    nodeKey: label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `room_${index + 1}`,
    roomName: label,
    confidence: labels.includes(label) ? 78 : 48,
    source: labels.includes(label) ? "media_room_label" : "fallback_room_template",
    mediaCount: media.filter((item) => item.roomLabel === label).length
  }));
  const tourEdges = tours.flatMap((tour) => (tour.hotspots ?? []).map((hotspot) => {
    const h = hotspot as LooseRecord;
    return {
      fromRoom: String(h.label ?? "tour_node"),
      toRoom: String(h.label ?? "connected_room"),
      confidence: 60,
      source: "tour_hotspot"
    };
  }));
  const inferredEdges = nodes.slice(0, -1).map((node, index) => ({
    fromRoom: node.roomName,
    toRoom: nodes[index + 1].roomName,
    confidence: index === 0 ? 72 : 58,
    source: "v18_inferred_sequence"
  }));
  const edges = tourEdges.length ? tourEdges : inferredEdges;

  const nodeModel = dbModel("spatialRoomGraphNode");
  const edgeModel = dbModel("spatialRoomGraphEdge");
  let persistedNodes = 0;
  let persistedEdges = 0;
  if (nodeModel.create) {
    for (const node of nodes) {
      await nodeModel.create({ data: { agencyId, listingId: listing.id, ...node, metadataJson: { generatedBy: "v18_room_graph_draft" } } });
      persistedNodes += 1;
    }
  }
  if (edgeModel.create) {
    for (const edge of edges) {
      await edgeModel.create({ data: { agencyId, listingId: listing.id, ...edge, metadataJson: { generatedBy: "v18_room_graph_draft" } } });
      persistedEdges += 1;
    }
  }
  const score = Math.min(100, nodes.length * 12 + edges.length * 8 + (labels.length ? 12 : 0));
  return { listingId: listing.id, score, status: score >= 75 ? "room_graph_ready" : "needs_manual_review", nodes, edges, persistedNodes, persistedEdges };
}

export async function getSpatialAcceptancePack(agencyId: string, listingId?: string) {
  const v17 = await getV17Readiness(agencyId);
  const digitalTwin = await getDigitalTwinReadiness(agencyId, listingId);
  const gpu = getGpuWorkerDeploymentPlan();
  const manifestValidation = await validateSceneManifestStrict(agencyId, undefined, listingId);
  const roomGraph = await buildRoomGraphDraft(agencyId, listingId);
  const viewerAdapters = getViewerAdapters();
  const gates = [
    { key: "input_capture", label: "Capture input coverage", score: digitalTwin.score, status: scoreStatus(digitalTwin.score), evidence: digitalTwin.status },
    { key: "worker_deploy", label: "GPU/provider worker deploy", score: gpu.score, status: scoreStatus(gpu.score), evidence: gpu.status },
    { key: "scene_manifest", label: "Strict scene manifest validation", score: manifestValidation.score, status: scoreStatus(manifestValidation.score), evidence: manifestValidation.status },
    { key: "room_graph", label: "Room graph draft", score: roomGraph.score, status: scoreStatus(roomGraph.score), evidence: `${roomGraph.nodes.length} node / ${roomGraph.edges.length} edge` },
    { key: "viewer", label: "Viewer adapter fallback", score: viewerAdapters.some((adapter) => adapter.status !== "blocked") ? 86 : 20, status: viewerAdapters.some((adapter) => adapter.status !== "blocked") ? "passed" : "failed", evidence: viewerAdapters.map((adapter) => `${adapter.adapterKey}:${adapter.status}`).join(", ") },
    { key: "v17_base", label: "V17 execution readiness", score: v17.score, status: scoreStatus(v17.score), evidence: v17.status }
  ];
  const score = Math.round(gates.reduce((sum, gate) => sum + gate.score, 0) / gates.length);
  const failed = gates.filter((gate) => gate.status === "failed");
  const status = failed.length ? "pilot_blocked" : score >= 86 ? "3d_pilot_accepted" : "3d_pilot_review";
  const model = dbModel("spatialAcceptanceRun");
  let run: unknown = null;
  if (model.create) {
    run = await model.create({ data: { agencyId, listingId: listingId ?? null, status, score, gatesJson: gates, evidenceJson: { digitalTwin, gpu, manifestValidation, roomGraph }, blockerJson: failed } });
  }
  return { run, status, score, gates, blockers: failed.map((gate) => `${gate.label}: ${gate.evidence}`), digitalTwin, gpu, manifestValidation, roomGraph, v17 };
}

export async function getV18Readiness(agencyId: string, listingId?: string) {
  const v17 = await getV17Readiness(agencyId);
  const gpu = getGpuWorkerDeploymentPlan();
  const dispatchPayload = await buildReconstructionDispatchPayload(agencyId, listingId).catch((error) => ({ error: error instanceof Error ? error.message : "Unknown dispatch error" }));
  const acceptance = await getSpatialAcceptancePack(agencyId, listingId).catch((error) => ({ status: "blocked", score: 0, gates: [], blockers: [error instanceof Error ? error.message : "Unknown acceptance error"] }));
  const checks = [
    { key: "v17_base", label: "V17 3D worker base", score: v17.score, status: scoreStatus(v17.score), evidence: v17.status },
    { key: "gpu_deploy", label: "GPU worker deployment skeleton", score: gpu.score, status: scoreStatus(gpu.score), evidence: gpu.nextAction },
    { key: "dispatch_contract", label: "V18 reconstruction dispatch contract", score: "error" in dispatchPayload ? 25 : 88, status: "error" in dispatchPayload ? "failed" : "passed", evidence: "error" in dispatchPayload ? dispatchPayload.error : `${dispatchPayload.mode} / ${dispatchPayload.checksum}` },
    { key: "acceptance", label: "3D pilot acceptance pack", score: acceptance.score, status: scoreStatus(Number(acceptance.score ?? 0)), evidence: acceptance.status }
  ];
  const score = Math.round(checks.reduce((sum, check) => sum + Number(check.score), 0) / checks.length);
  const failed = checks.filter((check) => check.status === "failed");
  const warnings = checks.filter((check) => check.status === "warning");
  const status = failed.length ? "v18_blocked" : warnings.length ? "v18_high_level_pilot_ready_with_review" : "v18_high_level_3d_ready";
  return {
    score,
    status,
    checks,
    blockers: checks.filter((check) => check.status !== "passed").map((check) => `${check.label}: ${check.evidence}`),
    v17,
    gpu,
    dispatchPayload,
    acceptance
  };
}
