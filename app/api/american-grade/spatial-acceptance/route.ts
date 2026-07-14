import { guarded } from "@/lib/api-response";
import { getSpatialProviderAcceptanceGate } from "@/lib/v22-american-grade";

export async function GET() {
  return guarded(async () => getSpatialProviderAcceptanceGate());
}
