import { ok } from "@/lib/api-response";
import { runConfigDoctor, summarizeDoctor } from "@/lib/config-doctor";

export async function GET() {
  const checks = runConfigDoctor();
  return ok({ summary: summarizeDoctor(checks), checks });
}
