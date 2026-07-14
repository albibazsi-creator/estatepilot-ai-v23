import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getDeploymentReadiness } from "@/lib/deployment";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getDeploymentReadiness(agency.id);
  });
}
