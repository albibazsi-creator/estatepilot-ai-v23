import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getCostControlSummary } from "@/lib/cost-control";

export async function GET() { return guarded(async () => { const { agency } = await getCurrentUser(); return getCostControlSummary(agency.id); }); }
