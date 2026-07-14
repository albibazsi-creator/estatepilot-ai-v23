import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getMonitoringSummary } from "@/lib/monitoring";

export async function GET() { return guarded(async () => { const { agency } = await getCurrentUser(); return getMonitoringSummary(agency.id); }); }
