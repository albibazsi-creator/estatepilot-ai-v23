import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getSloSummary, ensureSyntheticJourneys } from "@/lib/observability-v12";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const [slo, journeys] = await Promise.all([getSloSummary(agency.id), ensureSyntheticJourneys(agency.id)]);
    return { ...slo, journeys };
  });
}
