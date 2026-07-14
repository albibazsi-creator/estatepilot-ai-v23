import { getCostControlSummary } from "@/lib/cost-control";
import { getLaunchReadiness } from "@/lib/launch-readiness";
import { getMonitoringSummary } from "@/lib/monitoring";
import { getLatestTenantBoundaryChecks, runTenantBoundaryAudit } from "@/lib/tenant-boundary";
import { ensureRetentionPolicies } from "@/lib/data-retention";

export async function getV11Readiness(agencyId: string) {
  const latestChecks = await getLatestTenantBoundaryChecks(agencyId);
  const tenant = latestChecks.length ? { score: 100 - latestChecks.filter((c) => c.status !== "passed").length * 15, checks: latestChecks.slice(0, 8) } : await runTenantBoundaryAudit(agencyId);
  const [cost, launch, monitoring, retentionPolicies] = await Promise.all([
    getCostControlSummary(agencyId),
    getLaunchReadiness(agencyId),
    getMonitoringSummary(agencyId),
    ensureRetentionPolicies(agencyId)
  ]);
  const score = Math.round((Math.max(0, tenant.score) + launch.summary.score + (cost.status.state === "healthy" ? 100 : cost.status.state === "warning" ? 70 : 40) + (monitoring.summary.unhealthy === 0 ? 100 : 60)) / 4);
  const blockers = [
    ...launch.items.filter((i) => i.status !== "done" && i.severity === "critical").map((i) => i.title),
    ...(cost.status.state === "blocked" ? ["AI költség hard limit elérve"] : [])
  ];
  return { score, blockers, tenant, cost, launch: launch.summary, monitoring: monitoring.summary, retentionPolicies: retentionPolicies.length, status: score >= 85 && blockers.length === 0 ? "launch_candidate" : score >= 65 ? "demo_ready_with_blockers" : "needs_work" };
}
