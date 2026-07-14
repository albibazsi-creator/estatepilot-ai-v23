import { guarded } from "@/lib/api-response";
import { getLiveAiSlaGate } from "@/lib/v22-american-grade";

export async function GET() {
  return guarded(async () => getLiveAiSlaGate());
}
