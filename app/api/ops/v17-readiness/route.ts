import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getV17Readiness } from "@/lib/spatial-v17";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getV17Readiness(agency.id);
  });
}
