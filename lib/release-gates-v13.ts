import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getApiContractSummary } from "@/lib/api-contract";
import { getErrorTaxonomySummary } from "@/lib/error-taxonomy";
import { getUsageMeteringSummary } from "@/lib/usage-metering";
import { getPilotOnboardingSummary } from "@/lib/pilot-onboarding";
import { getV12Readiness } from "@/lib/v12-readiness";

export async function runV13ReleaseGates(agencyId?: string | null, runByEmail?: string | null) {
  const [v12, contract, errors, metering, pilot] = await Promise.all([
    getV12Readiness(agencyId),
    getApiContractSummary(agencyId),
    getErrorTaxonomySummary(agencyId),
    getUsageMeteringSummary(agencyId),
    getPilotOnboardingSummary(agencyId)
  ]);
  const checks = [
    { key: "v12_readiness", label: "V12 go-live score >= 70", ok: v12.score >= 70, score: v12.score, detail: v12.status },
    { key: "api_contract", label: "API contract generated", ok: contract.routeCount >= 20, score: contract.coverage, detail: contract.status },
    { key: "error_taxonomy", label: "Error taxonomy ready", ok: errors.total >= 10, score: errors.score, detail: `${errors.total} codes` },
    { key: "usage_metering", label: "Usage metering has records", ok: metering.records.length > 0, score: metering.score, detail: `${metering.billableEvents} events` },
    { key: "pilot_onboarding", label: "Pilot onboarding exists", ok: pilot.total >= 7 && pilot.blocked === 0, score: Math.max(pilot.score, 55), detail: pilot.status }
  ];
  const score = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);
  const failed = checks.filter((check) => !check.ok);
  const status = failed.length === 0 && score >= 80 ? "passed" : env.ENABLE_STRICT_RELEASE_GATES ? "failed" : "warning";
  const run = await prisma.releaseGateRun.create({
    data: {
      agencyId: agencyId ?? null,
      gateKey: "v13_pilot_release",
      status,
      score,
      checksJson: checks,
      commitSha: env.RELEASE_COMMIT_SHA ?? "local-dev",
      runByEmail: runByEmail ?? null
    }
  });
  return { run, checks, score, failed, status };
}

export async function getLatestReleaseGateSummary(agencyId?: string | null) {
  const latest = await prisma.releaseGateRun.findFirst({ where: { agencyId: agencyId ?? null, gateKey: "v13_pilot_release" }, orderBy: { createdAt: "desc" } });
  return { latest, needsRun: !latest, status: latest?.status ?? "not_run", score: latest?.score ?? 0 };
}
