import { guarded } from "@/lib/api-response";
import { getV21StartBeforeLaunchReadiness } from "@/lib/v21-start-before-launch";

export async function GET() {
  return guarded(async () => getV21StartBeforeLaunchReadiness());
}
