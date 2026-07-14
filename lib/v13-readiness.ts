import { getApiContractSummary } from "@/lib/api-contract";
import { getErrorTaxonomySummary } from "@/lib/error-taxonomy";
import { getUsageMeteringSummary } from "@/lib/usage-metering";
import { getPilotOnboardingSummary } from "@/lib/pilot-onboarding";
import { getLatestReleaseGateSummary } from "@/lib/release-gates-v13";
import { getV12Readiness } from "@/lib/v12-readiness";

export async function getV13Readiness(agencyId?: string | null) {
  const [v12, contract, errors, metering, pilot, releaseGate] = await Promise.all([
    getV12Readiness(agencyId),
    getApiContractSummary(agencyId),
    getErrorTaxonomySummary(agencyId),
    getUsageMeteringSummary(agencyId),
    getPilotOnboardingSummary(agencyId),
    getLatestReleaseGateSummary(agencyId)
  ]);
  const score = Math.round((v12.score + contract.coverage + errors.score + metering.score + Math.max(pilot.score, 55) + Math.max(releaseGate.score, 45)) / 6);
  const blockers = [
    ...(v12.blockers ?? []),
    ...(contract.status === "no_snapshot" ? ["API contract snapshot még nem lett mentve"] : []),
    ...(errors.total < 10 ? ["Hibakód taxonomy hiányos"] : []),
    ...(metering.records.length === 0 ? ["Usage metering még nem gyűjt adatot"] : []),
    ...(pilot.blocked > 0 ? ["Pilot onboarding milestone blokkolt"] : []),
    ...(releaseGate.needsRun ? ["V13 release gate még nem futott le"] : [])
  ];
  const status = score >= 85 && blockers.length === 0 ? "pilot_go_live_candidate" : score >= 70 ? "pilot_ready_with_notes" : "needs_hardening";
  return { score, status, blockers, v12, contract, errors, metering, pilot, releaseGate };
}
