import { prisma } from "@/lib/prisma";

export type SpatialStatus = "live" | "partial" | "mock" | "blocked";

export type SpatialProvider = {
  providerKey: string;
  providerName: string;
  area: "capture" | "reconstruction" | "viewer" | "floorplan" | "storage" | "quality";
  status: SpatialStatus;
  mode: "live" | "dry_run" | "mock";
  requiredEnv: string[];
  missingEnv: string[];
  capabilities: string[];
  notes: string;
  nextAction: string;
};

export type SpatialReadinessCheck = {
  key: string;
  label: string;
  status: "passed" | "warning" | "failed";
  score: number;
  evidence: string;
  nextAction: string;
};

function present(key: string) {
  const value = process.env[key];
  return Boolean(value && value.trim().length > 0);
}

function providerStatus(requiredEnv: string[], mockAllowed = true): SpatialStatus {
  const missing = requiredEnv.filter((key) => !present(key));
  if (missing.length === 0) return "live";
  if (missing.length < requiredEnv.length) return "partial";
  return mockAllowed ? "mock" : "blocked";
}

export function getSpatialProviderMatrix(): SpatialProvider[] {
  const providers = [
    {
      providerKey: "guided_mobile_capture",
      providerName: "Guided Mobile Capture PWA",
      area: "capture" as const,
      requiredEnv: ["MOBILE_CAPTURE_DEEP_LINK_BASE"],
      capabilities: ["room shot checklist", "walkthrough video instructions", "coverage scoring", "operator handoff"],
      notes: "MVP-ben PWA/deep-link workflow, natív app nélkül is használható."
    },
    {
      providerKey: "panorama_viewer",
      providerName: "Pannellum / Marzipano compatible viewer",
      area: "viewer" as const,
      requiredEnv: ["PANNELLUM_VIEWER_ENABLED"],
      capabilities: ["360 image view", "room nodes", "hotspot navigation", "embed-safe public viewer"],
      notes: "A 360 túra gyorsan élesíthető saját viewerrel, külső Matterport nélkül."
    },
    {
      providerKey: "gaussian_splat_worker",
      providerName: "Gaussian Splatting worker",
      area: "reconstruction" as const,
      requiredEnv: ["GAUSSIAN_SPLAT_WORKER_URL", "GAUSSIAN_SPLAT_WORKER_TOKEN"],
      capabilities: ["video/photo reconstruction", ".splat/.ply/.ksplat output", "preview render", "quality metrics"],
      notes: "V16-ban production interfész és job modell; saját GPU worker vagy külső API köthető rá."
    },
    {
      providerKey: "external_3d_api",
      providerName: "External 3D reconstruction API",
      area: "reconstruction" as const,
      requiredEnv: ["THREED_PROVIDER_API_URL", "THREED_PROVIDER_API_KEY"],
      capabilities: ["vendor dry-run", "asset upload", "provider job polling", "cost estimate"],
      notes: "Külső 3DGS / digital twin providerhez adapter-szerződés."
    },
    {
      providerKey: "spatial_asset_storage",
      providerName: "Spatial asset bucket/CDN",
      area: "storage" as const,
      requiredEnv: ["SPATIAL_ASSET_BUCKET", "SPATIAL_ASSET_CDN_URL"],
      capabilities: ["large scene files", "CDN viewer delivery", "private source upload", "public preview URLs"],
      notes: "Nagy .splat/.ply fájlokhoz külön bucket/CDN logika kell."
    },
    {
      providerKey: "floorplan_ai_linking",
      providerName: "Floorplan + room graph AI",
      area: "floorplan" as const,
      requiredEnv: ["OPENAI_API_KEY"],
      capabilities: ["room label extraction", "photo-room linking", "tour-floorplan mapping", "coverage gap detection"],
      notes: "Alaprajz, szobák és galéria/tour összekötése AI-val."
    }
  ];

  return providers.map((provider) => {
    const missingEnv = provider.requiredEnv.filter((key) => !present(key));
    const status = provider.providerKey === "panorama_viewer" && process.env.PANNELLUM_VIEWER_ENABLED === "true"
      ? "live"
      : providerStatus(provider.requiredEnv);
    return {
      ...provider,
      mode: status === "live" ? "live" : status === "partial" ? "dry_run" : "mock",
      status,
      missingEnv,
      nextAction: missingEnv.length ? `Állítsd be: ${missingEnv.join(", ")}` : "Provider live módra kapcsolható."
    };
  });
}

function check(status: SpatialReadinessCheck["status"], score: number, params: Omit<SpatialReadinessCheck, "status" | "score">): SpatialReadinessCheck {
  return { ...params, status, score };
}

export async function buildDigitalTwinChecks(agencyId: string, listingId?: string): Promise<SpatialReadinessCheck[]> {
  const listings = await prisma.listing.findMany({
    where: { agencyId, ...(listingId ? { id: listingId } : {}) },
    include: { media: true, tours: { include: { nodes: true, hotspots: true } }, floorplans: true },
    orderBy: { createdAt: "desc" },
    take: listingId ? 1 : 5
  });
  const listing = listings[0];
  const media = listing?.media ?? [];
  const photos = media.filter((item) => item.mediaType === "IMAGE");
  const panoramas = media.filter((item) => item.mediaType === "PANORAMA_360");
  const videos = media.filter((item) => item.mediaType === "VIDEO");
  const roomLabels = new Set(media.map((item) => item.roomLabel).filter(Boolean));
  const tour = listing?.tours[0];
  const providers = getSpatialProviderMatrix();
  const liveProviders = providers.filter((provider) => provider.status === "live").length;

  return [
    check(listing ? "passed" : "failed", listing ? 100 : 0, {
      key: "listing_scope",
      label: "3D-hez kiválasztott listing",
      evidence: listing ? `${listing.title} • ${listing.city}${listing.district ? `, ${listing.district}` : ""}` : "Nincs 3D auditálható listing",
      nextAction: "Hozz létre legalább egy listinget képekkel és alapadatokkal."
    }),
    check(photos.length >= 16 ? "passed" : photos.length >= 6 ? "warning" : "failed", Math.min(100, photos.length * 6), {
      key: "photo_overlap",
      label: "Fotó lefedettség 3D rekonstrukcióhoz",
      evidence: `${photos.length} normál fotó; V16 ajánlás: 16–40 átfedő fotó`,
      nextAction: "Fotózz minden szobát 4 sarokból + átjárókat/ajtókat külön."
    }),
    check(videos.length >= 1 ? "passed" : "warning", videos.length ? 100 : 55, {
      key: "walkthrough_video",
      label: "Walkthrough videó / mobil scan",
      evidence: `${videos.length} videó média`,
      nextAction: "Tölts fel 1 lassú, folyamatos bejáró videót a Gaussian Splatting pipeline-hoz."
    }),
    check(panoramas.length >= 3 ? "passed" : panoramas.length > 0 ? "warning" : "failed", Math.min(100, panoramas.length * 30), {
      key: "panorama_nodes",
      label: "360 panoráma node-ok",
      evidence: `${panoramas.length} 360 panoráma`,
      nextAction: "Minden fő helyiség közepéről készüljön 1 db 360 panoráma."
    }),
    check(roomLabels.size >= 5 ? "passed" : roomLabels.size >= 3 ? "warning" : "failed", Math.min(100, roomLabels.size * 18), {
      key: "room_labels",
      label: "Szobacímkék / room graph alap",
      evidence: `${roomLabels.size} azonosított szoba/helyiség címke`,
      nextAction: "Címkézd fel a médiákat: nappali, konyha, háló, fürdő, folyosó, erkély/kert."
    }),
    check((tour?.nodes.length ?? 0) >= 3 ? "passed" : tour ? "warning" : "failed", Math.min(100, (tour?.nodes.length ?? 0) * 30 + (tour ? 20 : 0)), {
      key: "tour_graph",
      label: "Tour node + hotspot graph",
      evidence: tour ? `${tour.nodes.length} node, ${tour.hotspots.length} hotspot` : "Nincs saját tour graph",
      nextAction: "Hozz létre room node-okat és legalább alap hotspot kapcsolatokat."
    }),
    check((listing?.floorplans.length ?? 0) > 0 ? "passed" : "warning", (listing?.floorplans.length ?? 0) > 0 ? 100 : 50, {
      key: "floorplan_linking",
      label: "Alaprajz összekötés",
      evidence: `${listing?.floorplans.length ?? 0} alaprajz`,
      nextAction: "Tölts fel alaprajzot, majd kösd a szobákhoz és a tour node-okhoz."
    }),
    check(liveProviders >= 3 ? "passed" : liveProviders >= 1 ? "warning" : "failed", Math.round((liveProviders / providers.length) * 100), {
      key: "spatial_providers",
      label: "3D provider adapterek",
      evidence: `${liveProviders}/${providers.length} provider live`,
      nextAction: providers.filter((provider) => provider.status !== "live").slice(0, 2).map((provider) => provider.nextAction).join(" • ") || "Minden kritikus 3D provider él."
    }),
    check(media.some((item) => item.disclosureRequired || item.isStaged) ? "warning" : "passed", media.some((item) => item.disclosureRequired || item.isStaged) ? 70 : 100, {
      key: "3d_disclosure",
      label: "AI / 3D disclosure kontroll",
      evidence: media.some((item) => item.disclosureRequired || item.isStaged) ? "Van jelölést igénylő staging/AI media" : "Nincs jelölés nélkül maradt AI staging média a mintában",
      nextAction: "Minden AI staging vagy 3D reconstruction preview mellett legyen disclosure text."
    })
  ];
}

export function summarizeSpatialChecks(checks: SpatialReadinessCheck[]) {
  const passed = checks.filter((check) => check.status === "passed").length;
  const warnings = checks.filter((check) => check.status === "warning").length;
  const failed = checks.filter((check) => check.status === "failed").length;
  const score = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / Math.max(1, checks.length));
  const status = failed > 1 ? "blocked" : failed === 1 ? "needs_capture" : warnings > 0 ? "spatial_dry_run" : "digital_twin_ready";
  const blockers = checks.filter((check) => check.status === "failed").map((check) => `${check.label}: ${check.nextAction}`);
  const recommendations = checks.filter((check) => check.status !== "passed").map((check) => ({ key: check.key, action: check.nextAction, evidence: check.evidence }));
  return { score, status, passed, warnings, failed, blockers, recommendations };
}

export async function getDigitalTwinReadiness(agencyId: string, listingId?: string) {
  const checks = await buildDigitalTwinChecks(agencyId, listingId);
  const summary = summarizeSpatialChecks(checks);
  return { ...summary, checks };
}

export async function runDigitalTwinReadinessAudit(agencyId: string, listingId?: string) {
  const readiness = await getDigitalTwinReadiness(agencyId, listingId);
  const create = (prisma as unknown as { digitalTwinReadinessRun?: { create: (args: unknown) => Promise<unknown> } }).digitalTwinReadinessRun?.create;
  let run: unknown = null;
  if (create) {
    run = await create({
      data: {
        agencyId,
        listingId,
        status: readiness.status,
        score: readiness.score,
        inputCoverage: Math.round(readiness.checks.slice(1, 5).reduce((sum, check) => sum + check.score, 0) / 4),
        geometryCoverage: Math.round(readiness.checks.slice(4, 7).reduce((sum, check) => sum + check.score, 0) / 3),
        viewerCoverage: readiness.checks.find((check) => check.key === "tour_graph")?.score ?? 0,
        complianceCoverage: readiness.checks.find((check) => check.key === "3d_disclosure")?.score ?? 0,
        checksJson: readiness.checks,
        blockersJson: readiness.blockers,
        recommendationsJson: readiness.recommendations
      }
    });
  }
  return { run, ...readiness };
}

export async function buildCapturePlan(agencyId: string, listingId?: string) {
  const listing = listingId
    ? await prisma.listing.findFirst({ where: { agencyId, id: listingId }, include: { media: true, tours: true, floorplans: true } })
    : await prisma.listing.findFirst({ where: { agencyId }, include: { media: true, tours: true, floorplans: true }, orderBy: { createdAt: "desc" } });

  const requiredShots = [
    { key: "living_room_4_corners", title: "Nappali 4 sarokból", priority: "critical", why: "Fő tér geometriája és hirdetés cover minőség." },
    { key: "doorways", title: "Minden átjáró/ajtó külön", priority: "critical", why: "Room graph és szobák közötti navigáció." },
    { key: "kitchen_bath", title: "Konyha + fürdő részletesen", priority: "high", why: "Vevői döntési pontok és staging kizárások." },
    { key: "slow_walkthrough_video", title: "1 lassú bejáró videó", priority: "high", why: "Gaussian Splatting / 3D reconstruction input." },
    { key: "360_center_each_room", title: "360 fotó minden fő szobából", priority: "high", why: "MVP saját 360 tour és hotspot viewer." },
    { key: "floorplan_upload", title: "Alaprajz PDF/kép", priority: "normal", why: "Floorplan + tour összekötés." },
    { key: "exterior_context", title: "Kültér / ház / lépcsőház / környezet", priority: "normal", why: "Listing bizalom és buyer context." }
  ];

  const instructions = [
    "Tartsd a telefont mellkas-magasságban, lehetőleg vízszintesen, túl gyors fordulás nélkül.",
    "A videónál lassan menj végig: bejárat → folyosó → nappali → konyha → háló(k) → fürdő → erkély/kert.",
    "A fotóknál legyen átfedés két egymás utáni nézőpont között, különösen az ajtóknál és átjáróknál.",
    "360 képnél állj a szoba közepére, és ne legyen mozgó ember/tükörben arc, ha nem szükséges.",
    "Minden AI staging/3D rekonstrukció csak jelölt previewként publikálható, eredeti képekkel együtt."
  ];

  const create = (prisma as unknown as { threeDCaptureSession?: { create: (args: unknown) => Promise<unknown> } }).threeDCaptureSession?.create;
  let session: unknown = null;
  if (create && listing) {
    session = await create({
      data: {
        agencyId,
        listingId: listing.id,
        mode: "guided_photo_video_360",
        status: "planned",
        captureQualityScore: 0,
        instructionsJson: instructions,
        requiredShotsJson: requiredShots,
        deviceHintsJson: { recommended: "iPhone/Android ultra-wide + 360 camera optional", minVideo: "1080p/30fps", avoid: ["fast panning", "dark rooms", "moving people"] }
      }
    });
  }

  return { listing, session, requiredShots, instructions };
}

export async function getSpatialPipelineSummary(agencyId: string) {
  const [readiness, providers, listings] = await Promise.all([
    getDigitalTwinReadiness(agencyId),
    Promise.resolve(getSpatialProviderMatrix()),
    prisma.listing.findMany({ where: { agencyId }, include: { media: true, tours: true, floorplans: true }, take: 10, orderBy: { createdAt: "desc" } })
  ]);
  const inputReadyListings = listings.filter((listing) => listing.media.length >= 6 && (listing.tours.length > 0 || listing.floorplans.length > 0)).length;
  const stages = [
    { key: "capture", label: "Guided capture", status: inputReadyListings ? "partial" : "mock", detail: `${inputReadyListings}/${listings.length} listing rendelkezik érdemi 3D inputtal` },
    { key: "input_validation", label: "Input validation", status: readiness.score >= 55 ? "partial" : "mock", detail: `${readiness.score}% digital twin readiness` },
    { key: "reconstruction", label: "3D reconstruction", status: providers.some((provider) => provider.providerKey.includes("splat") && provider.status === "live") ? "live" : "mock", detail: "External 3D API / Gaussian Splat worker adapter" },
    { key: "viewer", label: "Viewer delivery", status: providers.find((provider) => provider.providerKey === "panorama_viewer")?.status ?? "mock", detail: "360 viewer + future .splat/.ksplat viewer" },
    { key: "compliance", label: "Disclosure & approval", status: "partial", detail: "AI látványterv / 3D preview jelölés kötelező" }
  ];
  const score = Math.round((readiness.score * 0.45) + (providers.filter((provider) => provider.status === "live").length / providers.length) * 35 + (inputReadyListings ? 20 : 0));
  return { score, status: score >= 80 ? "spatial_pilot_ready" : score >= 55 ? "dry_run_ready" : "needs_capture", readiness, providers, listings, stages };
}
