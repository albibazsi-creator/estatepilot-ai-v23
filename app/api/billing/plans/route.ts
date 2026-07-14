import { ok } from "@/lib/api-response";
import { plans } from "@/lib/billing";

export async function GET() {
  return ok({ plans });
}
