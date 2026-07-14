import { guarded } from "@/lib/api-response";
import { getCrmRevenueAutomationQaGate } from "@/lib/v22-american-grade";

export async function GET() {
  return guarded(async () => getCrmRevenueAutomationQaGate());
}
