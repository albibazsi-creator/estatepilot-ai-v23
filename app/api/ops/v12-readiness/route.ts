import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getV12Readiness } from "@/lib/v12-readiness";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getV12Readiness(agency.id);
  });
}
