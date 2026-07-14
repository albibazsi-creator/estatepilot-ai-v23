import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getV16Readiness } from "@/lib/v16-readiness";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getV16Readiness(agency.id);
  });
}
