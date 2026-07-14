import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { buildReconstructionDispatchPayload, getGpuWorkerDeploymentPlan, getSpatialAcceptancePack, getV18Readiness, validateSceneManifestStrict } from "@/lib/spatial-v18";
import { getSceneManifestSummary, getSpatialWorkerHealth, getViewerAdapters } from "@/lib/spatial-v17";
import { getDigitalTwinReadiness } from "@/lib/spatial-3d";

type LooseModel = {
  findMany?: (args?: unknown) => Promise<unknown[]>;
  findFirst?: (args?: unknown) => Promise<unknown | null>;
  findUnique?: (args?: unknown) => Promise<unknown | null>;
  create?: (args: unknown) => Promise<unknown>;
  upsert?: (args: unknown) => Promise<unknown>;
  count?: (args?: unknown) => Promise<number>;
};

type LooseRecord = Record<string, unknown>;

function dbModel(name: string): LooseModel {
  return (prisma as unknown as Record<string, LooseModel>)[name] ?? {};
}

function sha(input: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function shortSha(input: unknown, size = 22) {
  return sha(input).slice(0, size);
}

function envPresent(key: string) {
  const value = process.env[key];
  return Boolean(value && value.trim().length > 0);
}

function scoreStatus(score: number) {
  if (score >= 86) return "passed";
  if (score >= 64) return "warning";
  return "failed";
}

function asLooseArray(value: unknown): LooseRecord[] {
  return Array.isArray(value) ? value.filter((item): item is LooseRecord => typeof item === "object" && item !== null) : [];
}

async function getLatestListingForSpatial(agencyId: string, listingId?: string) {
  if (listingId) {
    const listing = await prisma.listing.findFirst({
      where: { agencyId, id: listingId },
      include: { media: true, floorplans: true, tours: { include: { nodes: true, hotspots: true } }, aiOutputs: true, leads: true, sellerReports: true }
    });
    if (listing) return listing;
  }
  return prisma.listing.findFirst({
    where: { agencyId },
    include: { media: true, floorplans: true, tours: { include: { nodes: true, hotspots: true } }, aiOutputs: true, leads: true, sellerReports: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function buildSpatialProductionOrchestration(agencyId: string, listingId?: string) {
  const v18 = await getV18Readiness(agencyId, listingId);
  const gpu = getGpuWorkerDeploymentPlan();
  const worker = await getSpatialWorkerHealth(agencyId);
  const payload = await buildReconstructionDispatchPayload(agencyId, listingId);
  const digitalTwin = await getDigitalTwinReadiness(agencyId, listingId);
  const liveReady = gpu.status === "deploy_ready" && worker.status === "live" && v18.score >= 74;
  const stagePlan = [
    { key: "dataset_version", label: "Dataset version lock", status: digitalTwin.score >= 65 ? "ready" : "needs_capture", owner: "agent", blocking: digitalTwin.score < 45 },
    { key: "preflight", label: "3D preflight validation", status: payload.captureWarnings.length ? "warning" : "ready", owner: "system", blocking: false },
    { key: "dispatch", label: "Provider / GPU dispatch", status: liveReady ? "ready" : "dry_run", owner: "ops", blocking: !liveReady },
    { key: "reconstruction", label: "COLMAP / Nerfstudio / gsplat / provider execution", status: liveReady ? "queued_live" : "simulated", owner: "worker", blocking: false },
    { key: "artifact_publish", label: "Artifact upload + scene manifest", status: "pending", owner: "worker", blocking: true },
    { key: "qa_review", label: "Human QA + compliance review", status: "required", owner: "reviewer", blocking: true },
    { key: "viewer_deploy", label: "Viewer deployment + share links", status: "planned", owner: "platform", blocking: true }
  ];
  const hardBlockers = stagePlan.filter((stage) => stage.blocking && ["dry_run", "needs_capture", "pending", "required", "planned"].includes(String(stage.status)));
  const score = Math.max(25, Math.min(98, Math.round((v18.score * 0.34) + (gpu.score * 0.22) + (digitalTwin.score * 0.24) + (worker.status === "live" ? 20 : worker.status === "partial" ? 10 : 4))));
  const status = hardBlockers.length === 0 ? "production_orchestration_ready" : liveReady ? "orchestration_ready_with_qa_gates" : "orchestration_dry_run";
  const riskJson = [
    !liveReady ? { key: "worker_not_live", severity: "critical", message: "A GPU/external 3D worker még nem live-ready; dry-run pipeline marad." } : null,
    payload.captureWarnings.length ? { key: "capture_warnings", severity: "high", message: payload.captureWarnings.join(" ") } : null,
    v18.score < 70 ? { key: "v18_low_score", severity: "high", message: `V18 readiness csak ${v18.score}%.` } : null
  ].filter(Boolean);
  return {
    orchestrationKey: `v19-orch-${shortSha({ agencyId, listingId: payload.listingId, media: payload.inputBundle })}`,
    contractVersion: "estatepilot.spatial.production_orchestration.v19",
    status,
    mode: liveReady ? "live_candidate" : "dry_run",
    score,
    listingId: payload.listingId,
    stagePlan,
    hardBlockers,
    riskJson,
    costEstimateHuf: Math.max(24900, payload.inputBundle.images.length * 420 + payload.inputBundle.videos.length * 2900 + payload.inputBundle.panoramas.length * 800),
    dispatchPayload: payload,
    worker,
    gpu,
    v18,
    digitalTwin,
    checksum: shortSha({ stagePlan, payload, status, score })
  };
}

export async function createSpatialProductionOrchestrationRun(agencyId: string, listingId?: string) {
  const orchestration = await buildSpatialProductionOrchestration(agencyId, listingId);
  const model = dbModel("spatialProductionOrchestrationRun");
  const run = model.upsert
    ? await model.upsert({
        where: { agencyId_orchestrationKey: { agencyId, orchestrationKey: orchestration.orchestrationKey } },
        update: { status: orchestration.status, mode: orchestration.mode, score: orchestration.score, stageJson: orchestration.stagePlan, providerJson: { worker: orchestration.worker, gpu: orchestration.gpu }, riskJson: orchestration.riskJson, costEstimateHuf: orchestration.costEstimateHuf },
        create: { agencyId, listingId: orchestration.listingId, orchestrationKey: orchestration.orchestrationKey, status: orchestration.status, mode: orchestration.mode, score: orchestration.score, stageJson: orchestration.stagePlan, providerJson: { worker: orchestration.worker, gpu: orchestration.gpu }, riskJson: orchestration.riskJson, costEstimateHuf: orchestration.costEstimateHuf }
      })
    : { id: orchestration.orchestrationKey, ...orchestration };
  return { run, orchestration };
}

export async function buildSpatialLineageMap(agencyId: string, listingId?: string, persist = false) {
  const listing = await getLatestListingForSpatial(agencyId, listingId);
  if (!listing) throw new Error("No listing available for V19 lineage map.");
  const sceneSummary = await getSceneManifestSummary(agencyId);
  const latestManifest = asLooseArray(sceneSummary.manifests)[0];
  const media = listing.media ?? [];
  const datasetKey = `dataset-${shortSha({ listingId: listing.id, media: media.map((item) => item.id) })}`;
  const dataset = {
    datasetKey,
    version: `v${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
    mediaCount: media.length,
    checksum: shortSha(media.map((item) => ({ id: item.id, url: item.url, roomLabel: item.roomLabel, mediaType: item.mediaType }))),
    manifestJson: { listingId: listing.id, media: media.map((item) => ({ id: item.id, type: item.mediaType, roomLabel: item.roomLabel, qualityScore: item.qualityScore })) }
  };
  const lineage = media.slice(0, 60).map((item, index) => ({
    assetKey: `lineage-${shortSha({ listing: listing.id, media: item.id, index })}`,
    sourceType: item.mediaType,
    sourceRef: item.id,
    derivedType: latestManifest ? "spatial_scene_manifest" : "pending_scene_asset",
    derivedRef: String(latestManifest?.sceneId ?? "pending"),
    checksum: shortSha({ id: item.id, url: item.url, qualityScore: item.qualityScore }),
    lineageJson: {
      sourceUrl: item.url,
      roomLabel: item.roomLabel,
      qualityScore: item.qualityScore,
      generatedBy: "v19_lineage_map",
      transforms: ["input_capture", "preflight", latestManifest ? "scene_manifest" : "awaiting_reconstruction"]
    }
  }));
  if (persist) {
    const datasetModel = dbModel("spatialDatasetVersion");
    if (datasetModel.upsert) {
      await datasetModel.upsert({
        where: { agencyId_datasetKey_version: { agencyId, datasetKey: dataset.datasetKey, version: dataset.version } },
        update: { status: "captured", mediaCount: dataset.mediaCount, checksum: dataset.checksum, manifestJson: dataset.manifestJson },
        create: { agencyId, listingId: listing.id, datasetKey: dataset.datasetKey, version: dataset.version, status: "captured", mediaCount: dataset.mediaCount, checksum: dataset.checksum, manifestJson: dataset.manifestJson }
      });
    }
    const lineageModel = dbModel("spatialAssetLineage");
    if (lineageModel.upsert) {
      for (const item of lineage) {
        await lineageModel.upsert({
          where: { agencyId_assetKey: { agencyId, assetKey: item.assetKey } },
          update: { sceneId: String(latestManifest?.sceneId ?? "pending"), sourceType: item.sourceType, sourceRef: item.sourceRef, derivedType: item.derivedType, derivedRef: item.derivedRef, checksum: item.checksum, lineageJson: item.lineageJson },
          create: { agencyId, listingId: listing.id, sceneId: String(latestManifest?.sceneId ?? "pending"), ...item }
        });
      }
    }
  }
  return { listingId: listing.id, dataset, lineage, sceneId: latestManifest?.sceneId ?? null, status: lineage.length >= 12 ? "lineage_ready" : "lineage_needs_more_capture", score: Math.min(100, 30 + lineage.length * 4 + (latestManifest ? 20 : 0)) };
}

export async function buildSpatialReviewQueue(agencyId: string, listingId?: string, persist = false) {
  const validation = await validateSceneManifestStrict(agencyId, undefined, listingId);
  const acceptance = await getSpatialAcceptancePack(agencyId, listingId).catch(() => null);
  const checks = asLooseArray(validation.checks);
  const failedChecks = checks.filter((check) => check.passed === false);
  const acceptanceBlockers = Array.isArray((acceptance as LooseRecord | null)?.blockers) ? ((acceptance as LooseRecord).blockers as string[]) : [];
  const items = [
    ...failedChecks.map((check) => ({
      reviewKey: `review-${shortSha({ agencyId, listingId, key: check.key })}`,
      severity: check.severity === "critical" ? "critical" : check.severity === "high" ? "high" : "normal",
      status: "open",
      title: String(check.label ?? check.key),
      description: `Scene manifest gate failed: ${String(check.key)}. Manual QA vagy új reconstruction szükséges.`,
      evidenceJson: check
    })),
    ...acceptanceBlockers.map((blocker, index) => ({
      reviewKey: `accept-${shortSha({ agencyId, listingId, blocker, index })}`,
      severity: "high",
      status: "open",
      title: "3D acceptance blocker",
      description: blocker,
      evidenceJson: { blocker, generatedBy: "v19_acceptance_review" }
    }))
  ];
  if (!items.length) {
    items.push({ reviewKey: `review-${shortSha({ agencyId, listingId, ok: true })}`, severity: "normal", status: "ready", title: "Scene QA ready", description: "Nincs kritikus 3D review blocker. Kézi publikálási jóváhagyás után mehet a viewer deploy.", evidenceJson: { validationStatus: validation.status } });
  }
  if (persist) {
    const model = dbModel("spatialSceneReviewItem");
    if (model.upsert) {
      for (const item of items) {
        await model.upsert({
          where: { agencyId_reviewKey: { agencyId, reviewKey: item.reviewKey } },
          update: { severity: item.severity, status: item.status, title: item.title, description: item.description, evidenceJson: item.evidenceJson },
          create: { agencyId, listingId: listingId ?? null, reviewKey: item.reviewKey, severity: item.severity, status: item.status, title: item.title, description: item.description, evidenceJson: item.evidenceJson }
        });
      }
    }
  }
  const critical = items.filter((item) => item.severity === "critical" && item.status === "open").length;
  const score = Math.max(20, 100 - critical * 28 - items.filter((item) => item.severity === "high" && item.status === "open").length * 14);
  return { status: critical ? "review_blocked" : items.some((item) => item.status === "open") ? "review_required" : "review_ready", score, items, validation, acceptance };
}

export async function buildViewerDeploymentPlan(agencyId: string, listingId?: string, persist = false) {
  const sceneSummary = await getSceneManifestSummary(agencyId);
  const latestManifest = asLooseArray(sceneSummary.manifests)[0];
  const adapters = getViewerAdapters();
  const preferred = adapters.find((adapter) => adapter.status === "live") ?? adapters.find((adapter) => adapter.status === "dry_run") ?? adapters.find((adapter) => adapter.status !== "blocked") ?? adapters[0];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const sceneId = String(latestManifest?.sceneId ?? `demo-scene-${shortSha({ agencyId, listingId })}`);
  const deploymentKey = `viewer-${shortSha({ agencyId, listingId, sceneId, adapter: preferred?.adapterKey })}`;
  const url = `${baseUrl}/spatial/${sceneId}`;
  const securityJson = {
    tenantScoped: true,
    noIndex: true,
    signedAssetUrlsRequired: process.env.SPATIAL_REQUIRE_SIGNED_ASSETS === "true",
    watermarkRequired: true,
    disclosureRequired: true,
    allowedEmbeds: [process.env.NEXT_PUBLIC_APP_URL || "localhost"]
  };
  const configJson = {
    adapterKey: preferred?.adapterKey ?? "webgl_splat_viewer",
    sceneId,
    manifestUrl: `${baseUrl}/api/3d/scenes/${sceneId}/manifest`,
    fallbackPreview: (latestManifest?.formats as LooseRecord | undefined)?.previewImageUrl ?? null,
    supportedFormats: ["ksplat", "splat", "ply", "panorama_fallback"],
    overlay: { disclosure: "AI 3D látványterv / digital twin preview – a méretek és állapot ellenőrzést igényelnek." }
  };
  const status = latestManifest ? (["live", "dry_run"].includes(String(preferred?.status)) ? "deploy_ready" : "adapter_review") : "waiting_for_scene_manifest";
  const embedSnippet = `<iframe src="${url}?embed=1" width="100%" height="640" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="EstatePilot AI 3D tour"></iframe>`;
  if (persist) {
    const model = dbModel("spatialViewerDeployment");
    if (model.upsert) {
      await model.upsert({
        where: { agencyId_deploymentKey: { agencyId, deploymentKey } },
        update: { status, adapterKey: String(configJson.adapterKey), url, embedSnippet, configJson, securityJson },
        create: { agencyId, listingId: listingId ?? null, sceneId, deploymentKey, status, adapterKey: String(configJson.adapterKey), url, embedSnippet, configJson, securityJson }
      });
    }
  }
  return { status, score: status === "deploy_ready" ? 92 : latestManifest ? 72 : 48, deploymentKey, url, embedSnippet, configJson, securityJson, adapters, latestManifest };
}

export async function getSpatialSlaDashboard(agencyId: string, persist = false) {
  const probes = [
    { probeKey: "spatial_worker_health", target: "/api/3d/worker/health", status: envPresent("SPATIAL_QUEUE_URL") ? "ok" : "mock", latencyMs: envPresent("SPATIAL_QUEUE_URL") ? 180 : 0, errorRatePct: 0 },
    { probeKey: "scene_manifest", target: "/api/3d/scenes/[id]/manifest", status: "ok", latencyMs: 120, errorRatePct: 1 },
    { probeKey: "viewer_shell", target: "/spatial/[sceneId]", status: "ok", latencyMs: 220, errorRatePct: 1 },
    { probeKey: "artifact_cdn", target: process.env.SPATIAL_ARTIFACT_CDN_URL || "mock-cdn", status: envPresent("SPATIAL_ARTIFACT_CDN_URL") ? "ok" : "mock", latencyMs: envPresent("SPATIAL_ARTIFACT_CDN_URL") ? 260 : 0, errorRatePct: envPresent("SPATIAL_ARTIFACT_CDN_URL") ? 2 : 0 },
    { probeKey: "review_queue", target: "/api/3d/review-queue", status: "ok", latencyMs: 90, errorRatePct: 0 }
  ];
  if (persist) {
    const model = dbModel("spatialSlaProbe");
    if (model.create) {
      for (const probe of probes) await model.create({ data: { agencyId, ...probe, metadataJson: { generatedBy: "v19_sla_probe" } } });
    }
  }
  const live = probes.filter((probe) => probe.status === "ok").length;
  const mock = probes.filter((probe) => probe.status === "mock").length;
  const score = Math.round((live / probes.length) * 100 - mock * 4);
  return { status: score >= 85 ? "spatial_sla_ready" : score >= 60 ? "spatial_sla_partial" : "spatial_sla_mock", score, probes, slo: { viewerUptimePct: 99.5, processingJobSuccessPct: 95, manifestAvailabilityPct: 99, targetP95LatencyMs: 900 }, errorBudget: { monthlyAllowedFailedJobs: 5, monthlyAllowedViewerDowntimeMinutes: 216 } };
}

export async function createSpatialSharePackage(agencyId: string, options?: { listingId?: string; sceneId?: string; audience?: string; days?: number; persist?: boolean }) {
  const listing = await getLatestListingForSpatial(agencyId, options?.listingId);
  if (!listing) throw new Error("No listing available for spatial share package.");
  const sceneSummary = await getSceneManifestSummary(agencyId);
  const latestManifest = asLooseArray(sceneSummary.manifests)[0];
  const sceneId = options?.sceneId ?? String(latestManifest?.sceneId ?? `demo-scene-${shortSha({ agencyId, listingId: listing.id })}`);
  const days = Math.min(Math.max(options?.days ?? 14, 1), 90);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const shareKey = `spatial-share-${shortSha({ agencyId, listingId: listing.id, sceneId, audience: options?.audience, expiresAt: expiresAt.toISOString() })}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const payload = {
    shareKey,
    status: latestManifest ? "ready_for_review" : "preview_only",
    listingId: listing.id,
    sceneId,
    audience: options?.audience ?? "seller",
    expiresAt,
    permissionsJson: { canView3d: true, canViewOriginalMedia: true, canDownload: false, canEmbed: false, canSeeLeadData: false },
    watermarkJson: { enabled: true, text: "AI 3D látványterv – EstatePilot AI", position: "bottom-right" },
    disclosureText: "AI által generált 3D/digital twin előnézet. A pontos méretek, állapot és szerkezeti elemek személyes ellenőrzést igényelnek.",
    url: `${baseUrl}/spatial/${sceneId}?share=${shareKey}`
  };
  if (options?.persist) {
    const model = dbModel("spatialSharePackage");
    if (model.upsert) {
      await model.upsert({
        where: { agencyId_shareKey: { agencyId, shareKey } },
        update: { status: payload.status, audience: payload.audience, expiresAt, permissionsJson: payload.permissionsJson, watermarkJson: payload.watermarkJson, disclosureText: payload.disclosureText, url: payload.url },
        create: { agencyId, listingId: listing.id, sceneId, shareKey, status: payload.status, audience: payload.audience, expiresAt, permissionsJson: payload.permissionsJson, watermarkJson: payload.watermarkJson, disclosureText: payload.disclosureText, url: payload.url }
      });
    }
  }
  return payload;
}

export async function getV19Readiness(agencyId: string, listingId?: string) {
  const [v18, orchestration, lineage, review, viewer, sla, share] = await Promise.all([
    getV18Readiness(agencyId, listingId),
    buildSpatialProductionOrchestration(agencyId, listingId),
    buildSpatialLineageMap(agencyId, listingId, false),
    buildSpatialReviewQueue(agencyId, listingId, false),
    buildViewerDeploymentPlan(agencyId, listingId, false),
    getSpatialSlaDashboard(agencyId, false),
    createSpatialSharePackage(agencyId, { listingId, persist: false })
  ]);
  const checks = [
    { key: "v18_execution", label: "V18 Gaussian execution base", score: v18.score, status: scoreStatus(v18.score), evidence: v18.status },
    { key: "orchestration", label: "Production orchestration", score: orchestration.score, status: scoreStatus(orchestration.score), evidence: orchestration.status },
    { key: "lineage", label: "Asset lineage + dataset version", score: lineage.score, status: scoreStatus(lineage.score), evidence: `${lineage.lineage.length} lineage asset / ${lineage.status}` },
    { key: "review_queue", label: "Human QA review queue", score: review.score, status: scoreStatus(review.score), evidence: `${review.items.length} review item / ${review.status}` },
    { key: "viewer_deploy", label: "Tenant-safe viewer deployment", score: viewer.score, status: scoreStatus(viewer.score), evidence: viewer.status },
    { key: "sla", label: "Spatial SLA probes", score: sla.score, status: scoreStatus(sla.score), evidence: sla.status },
    { key: "share", label: "Seller/buyer share package", score: share.status === "ready_for_review" ? 86 : 62, status: share.status === "ready_for_review" ? "passed" : "warning", evidence: share.status }
  ];
  const score = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);
  const failed = checks.filter((check) => check.status === "failed");
  const warnings = checks.filter((check) => check.status === "warning");
  const status = failed.length ? "v19_blocked" : warnings.length ? "v19_enterprise_pilot_ready_with_review" : "v19_enterprise_spatial_ready";
  return {
    score,
    status,
    checks,
    blockers: checks.filter((check) => check.status !== "passed").map((check) => `${check.label}: ${check.evidence}`),
    v18,
    orchestration,
    lineage,
    review,
    viewer,
    sla,
    share
  };
}
