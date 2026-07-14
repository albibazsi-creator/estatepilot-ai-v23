import { prisma } from "@/lib/prisma";
import { getProductionAdapterSummary } from "@/lib/production-adapters";

export type CoreFlowCheck = {
  key: string;
  label: string;
  status: "passed" | "warning" | "failed";
  score: number;
  evidence: string;
  nextAction?: string;
};

function statusFrom(ok: boolean, warning: boolean): "passed" | "warning" | "failed" {
  if (ok) return "passed";
  return warning ? "warning" : "failed";
}

export async function buildCorePilotChecks(agencyId: string): Promise<CoreFlowCheck[]> {
  const [listings, leads, sellerReports, campaigns, deals, aiOutputs, adapters] = await Promise.all([
    prisma.listing.findMany({ where: { agencyId }, include: { media: true, tours: true, floorplans: true, leads: true, sellerReports: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.lead.findMany({ where: { listing: { agencyId } }, take: 20 }),
    prisma.sellerReport.findMany({ where: { listing: { agencyId } }, take: 10 }),
    prisma.marketingCampaign.findMany({ where: { agencyId }, take: 10 }).catch(() => []),
    prisma.dealPipelineItem.findMany({ where: { agencyId }, take: 10 }).catch(() => []),
    prisma.aiOutput.findMany({ where: { listing: { agencyId } }, take: 20 }),
    getProductionAdapterSummary(agencyId)
  ]);

  const primary = listings[0];
  const checks: CoreFlowCheck[] = [];
  checks.push({
    key: "listing_created",
    label: "Ingatlan létrehozva",
    status: statusFrom(listings.length > 0, false),
    score: listings.length > 0 ? 100 : 0,
    evidence: `${listings.length} listing van az agency alatt`,
    nextAction: listings.length ? undefined : "Hozz létre legalább 1 demo/pilot ingatlant."
  });
  checks.push({
    key: "media_ready",
    label: "Kép/galéria készen áll",
    status: statusFrom(Boolean(primary && primary.media.length >= 6 && primary.media.some((m) => m.isCover)), Boolean(primary && primary.media.length >= 3)),
    score: primary ? Math.min(100, primary.media.length * 12 + (primary.media.some((m) => m.isCover) ? 28 : 0)) : 0,
    evidence: primary ? `${primary.media.length} média, cover: ${primary.media.some((m) => m.isCover) ? "igen" : "nem"}` : "Nincs listing",
    nextAction: "Legalább 6 kép + cover image legyen minden pilot listingnél."
  });
  checks.push({
    key: "public_listing",
    label: "Publikus landing oldal publikálható",
    status: statusFrom(Boolean(primary?.slug && (primary.isPublished || primary.status === "PUBLISHED")), Boolean(primary?.slug)),
    score: primary?.slug ? (primary.isPublished || primary.status === "PUBLISHED" ? 100 : 65) : 0,
    evidence: primary?.slug ? `/listing/${primary.slug}` : "Slug hiányzik",
    nextAction: "A publish gate után publikáld a landing oldalt."
  });
  checks.push({
    key: "ai_outputs",
    label: "AI anyagok elkészültek",
    status: statusFrom(aiOutputs.length >= 3, aiOutputs.length > 0),
    score: Math.min(100, aiOutputs.length * 30),
    evidence: `${aiOutputs.length} AI output`,
    nextAction: "Generálj hirdetésszöveget, social csomagot és seller summaryt."
  });
  checks.push({
    key: "tour_floorplan",
    label: "Tour / alaprajz legalább részben megvan",
    status: statusFrom(Boolean(primary && primary.tours.length > 0 && primary.floorplans.length > 0), Boolean(primary && (primary.tours.length > 0 || primary.floorplans.length > 0))),
    score: primary ? (primary.tours.length > 0 ? 45 : 0) + (primary.floorplans.length > 0 ? 45 : 0) + 10 : 0,
    evidence: primary ? `${primary.tours.length} tour, ${primary.floorplans.length} alaprajz` : "Nincs listing",
    nextAction: "MVP-ben elég Matterport/iframe vagy 360 link + alaprajz upload."
  });
  checks.push({
    key: "lead_capture",
    label: "Lead capture működik",
    status: statusFrom(leads.length > 0, false),
    score: leads.length > 0 ? 100 : 0,
    evidence: `${leads.length} lead`,
    nextAction: "Küldj be teszt leadet a publikus listing oldalról GDPR checkboxszal."
  });
  checks.push({
    key: "lead_scoring",
    label: "Lead scoring értéket ad",
    status: statusFrom(leads.some((l) => l.leadScore > 0), leads.length > 0),
    score: leads.some((l) => l.leadScore > 0) ? 100 : leads.length > 0 ? 55 : 0,
    evidence: `${leads.filter((l) => l.leadScore > 0).length} pontozott lead`,
    nextAction: "A lead submit után futtasd a scoringot és mentsd a reason/next action értéket."
  });
  checks.push({
    key: "seller_report",
    label: "Tulajdonosi riport generálható",
    status: statusFrom(sellerReports.length > 0, false),
    score: sellerReports.length > 0 ? 100 : 0,
    evidence: `${sellerReports.length} seller report`,
    nextAction: "Generálj heti seller reportot és ellenőrizd az export/send flow-t."
  });
  checks.push({
    key: "campaign_and_deal",
    label: "Marketing + sales follow-up összezár",
    status: statusFrom(campaigns.length > 0 && deals.length > 0, campaigns.length > 0 || deals.length > 0),
    score: Math.min(100, campaigns.length * 45 + deals.length * 45),
    evidence: `${campaigns.length} kampány, ${deals.length} deal`,
    nextAction: "A pilot ügyfélnek legyen kampánycsomag és legalább 1 pipeline elem."
  });
  checks.push({
    key: "live_adapters",
    label: "Éles provider adapterek",
    status: adapters.score >= 85 ? "passed" : adapters.score >= 65 ? "warning" : "failed",
    score: adapters.score,
    evidence: `${adapters.live} live, ${adapters.partial} partial, ${adapters.mock} mock adapter`,
    nextAction: adapters.blockers[0] ?? "Kritikus provider adapterek élnek."
  });
  return checks;
}

export function summarizeCoreChecks(checks: CoreFlowCheck[]) {
  const passed = checks.filter((c) => c.status === "passed").length;
  const warnings = checks.filter((c) => c.status === "warning").length;
  const failed = checks.filter((c) => c.status === "failed").length;
  const score = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / Math.max(1, checks.length));
  const status = failed > 0 ? (score >= 65 ? "warning" : "blocked") : warnings > 0 ? "warning" : "passed";
  const blockers = checks.filter((c) => c.status === "failed").map((c) => `${c.label}: ${c.nextAction ?? c.evidence}`);
  const recommendations = checks.filter((c) => c.status !== "passed").map((c) => ({ key: c.key, action: c.nextAction, evidence: c.evidence }));
  return { score, status, passed, warnings, failed, blockers, recommendations };
}

export async function runCorePilotFlow(agencyId: string, runByEmail?: string) {
  const checks = await buildCorePilotChecks(agencyId);
  const summary = summarizeCoreChecks(checks);
  const run = await prisma.corePilotFlowRun.create({
    data: {
      agencyId,
      coreFlowVersion: "v14",
      status: summary.status,
      score: summary.score,
      passed: summary.passed,
      warnings: summary.warnings,
      failed: summary.failed,
      checksJson: checks,
      blockersJson: summary.blockers,
      recommendationsJson: summary.recommendations,
      runByEmail
    }
  });
  return { run, checks, ...summary };
}

export async function getCorePilotStatus(agencyId: string) {
  const [latestRuns, checks] = await Promise.all([
    prisma.corePilotFlowRun.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 5 }),
    buildCorePilotChecks(agencyId)
  ]);
  const summary = summarizeCoreChecks(checks);
  return { ...summary, checks, latestRuns };
}
