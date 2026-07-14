import { guarded } from "@/lib/api-response";
import { getV20TestingReadiness } from "@/lib/v20-testing";

export async function GET() {
  return guarded(async () => {
    const readiness = getV20TestingReadiness();
    return {
      artifact: "estatepilot-ai-mvp-v20",
      checksum: readiness.checksum,
      metrics: readiness.metrics,
      gates: readiness.gates,
      verdict: readiness.status
    };
  });
}
