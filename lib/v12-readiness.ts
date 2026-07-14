import { getAcceptanceSummary } from "@/lib/acceptance-tests";
import { getDeploymentReadiness } from "@/lib/deployment";
import { getDomainReadiness } from "@/lib/domain-readiness";
import { getProviderHealthSummary } from "@/lib/provider-health";
import { getSecretRotationSummary } from "@/lib/secret-rotation";
import { getSloSummary, ensureSyntheticJourneys } from "@/lib/observability-v12";
import { getV11Readiness } from "@/lib/v11-readiness";

export async function getV12Readiness(agencyId?: string | null) {
  const [v11, providers, deployment, domains, secrets, slos, acceptance] = await Promise.all([
    agencyId ? getV11Readiness(agencyId) : Promise.resolve({ score: 60, blockers: [] as string[], status: "global" }),
    getProviderHealthSummary(agencyId),
    getDeploymentReadiness(agencyId),
    getDomainReadiness(agencyId),
    getSecretRotationSummary(agencyId),
    getSloSummary(agencyId),
    getAcceptanceSummary(agencyId)
  ]);
  await ensureSyntheticJourneys(agencyId);
  const acceptanceScore = acceptance.lastRun?.score ?? 35;
  const score = Math.round((v11.score + providers.score + deployment.score + domains.score + secrets.score + slos.score + acceptanceScore) / 7);
  const blockers = [
    ...(v11.blockers ?? []),
    ...(providers.mock > 3 ? ["Túl sok provider mock módban van élesítéshez"] : []),
    ...(domains.status !== "ready" ? ["Domain / SSL még nincs verifikálva"] : []),
    ...(acceptance.needsRun ? ["Go-live acceptance suite még nem futott le"] : []),
    ...(slos.atRisk > 2 ? ["Több SLO cél at-risk állapotban van"] : [])
  ];
  const status = score >= 88 && blockers.length === 0 ? "go_live_candidate" : score >= 70 ? "pilot_ready" : "needs_hardening";
  return { score, status, blockers, v11, providers, deployment, domains, secrets, slos, acceptance };
}
