import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getV19Readiness } from "@/lib/spatial-v19";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getV19Readiness(agency.id);
  });
}
