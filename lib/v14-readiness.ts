import { getV13Readiness } from "@/lib/v13-readiness";
import { getCorePilotStatus } from "@/lib/core-pilot-flow";
import { getProductionAdapterSummary } from "@/lib/production-adapters";
import { getV14E2eSummary } from "@/lib/e2e-scenarios-v14";
import { syncLaunchRisks } from "@/lib/launch-risks-v14";

export async function getV14Readiness(agencyId: string) {
  const [v13, core, adapters, e2e, risks] = await Promise.all([
    getV13Readiness(agencyId),
    getCorePilotStatus(agencyId),
    getProductionAdapterSummary(agencyId),
    getV14E2eSummary(agencyId),
    syncLaunchRisks(agencyId)
  ]);
  const score = Math.round(v13.score * 0.18 + core.score * 0.34 + adapters.score * 0.22 + e2e.score * 0.14 + risks.score * 0.12);
  const blockers = [
    ...core.blockers,
    ...adapters.blockers,
    ...risks.risks.filter((r) => r.status === "open" && ["critical", "high"].includes(r.severity)).map((r) => `${r.title}: ${r.mitigation ?? "nincs mitigation"}`)
  ];
  const status = blockers.some((b) => b.toLowerCase().includes("auth") || b.toLowerCase().includes("build")) ? "blocked" : score >= 85 ? "pilot_ready" : score >= 70 ? "near_pilot" : "needs_hardening";
  return { score, status, v13, core, adapters, e2e, risks, blockers: Array.from(new Set(blockers)).slice(0, 12) };
}
