import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getDomainReadiness } from "@/lib/domain-readiness";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getDomainReadiness(agency.id);
  });
}
