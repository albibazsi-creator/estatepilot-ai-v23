import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { createSandboxResetPlan } from "@/lib/sandbox";

export async function GET() { return guarded(async () => { const { agency } = await getCurrentUser(); return createSandboxResetPlan(agency.id); }); }
