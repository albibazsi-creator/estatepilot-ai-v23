import { guarded } from "@/lib/api-response";
import { getV20TestingReadiness } from "@/lib/v20-testing";

export async function GET() {
  return guarded(async () => getV20TestingReadiness());
}
