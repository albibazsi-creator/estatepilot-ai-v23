import { getCurrentUser } from "@/lib/current-user";
import { guarded } from "@/lib/api-response";
import { calculateV10Readiness } from "@/lib/v10-readiness";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return calculateV10Readiness(agency.id);
  });
}
