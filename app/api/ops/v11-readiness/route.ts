import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getV11Readiness } from "@/lib/v11-readiness";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getV11Readiness(agency.id);
  });
}
