import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getSpatialProviderMatrix } from "@/lib/spatial-3d";

export async function GET() {
  return guarded(async () => {
    await getCurrentUser();
    const providers = getSpatialProviderMatrix();
    return { providers, live: providers.filter((provider) => provider.status === "live").length, total: providers.length };
  });
}
