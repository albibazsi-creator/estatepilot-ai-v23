import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getV18Readiness } from "@/lib/spatial-v18";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getV18Readiness(agency.id);
  });
}
