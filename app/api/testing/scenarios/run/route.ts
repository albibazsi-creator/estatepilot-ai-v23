import { guarded } from "@/lib/api-response";
import { getV20TestingReadiness } from "@/lib/v20-testing";

export async function POST() {
  return guarded(async () => {
    const readiness = getV20TestingReadiness();
    return {
      status: readiness.blockers.length ? "scenario_pack_blocked" : "scenario_pack_ready",
      score: readiness.score,
      scenarios: readiness.scenarioPack.map((name, index) => ({ id: `v20-scenario-${index + 1}`, name, status: readiness.blockers.length ? "needs_local_run" : "ready_for_local_run" })),
      blockers: readiness.blockers
    };
  });
}
