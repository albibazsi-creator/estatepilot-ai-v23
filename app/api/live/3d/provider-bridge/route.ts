import { guarded } from "@/lib/api-response";
import { getLive3dProviderBridge } from "@/lib/v21-start-before-launch";

export async function GET() {
  return guarded(async () => getLive3dProviderBridge());
}
