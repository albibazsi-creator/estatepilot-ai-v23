import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getSpatialPipelineSummary } from "@/lib/spatial-3d";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getSpatialPipelineSummary(agency.id);
  });
}
