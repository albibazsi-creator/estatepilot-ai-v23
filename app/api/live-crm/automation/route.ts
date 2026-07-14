import { guarded } from "@/lib/api-response";
import { getLiveCrmAutomationPlan } from "@/lib/v21-start-before-launch";

export async function GET() {
  return guarded(async () => getLiveCrmAutomationPlan());
}
