import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getSecretRotationSummary } from "@/lib/secret-rotation";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getSecretRotationSummary(agency.id);
  });
}
