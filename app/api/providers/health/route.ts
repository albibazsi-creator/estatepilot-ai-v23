import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getProviderHealthSummary, runProviderHealthCheck } from "@/lib/provider-health";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getProviderHealthSummary(agency.id);
  });
}

export async function POST() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const checks = await runProviderHealthCheck(agency.id);
    return { checks };
  });
}
