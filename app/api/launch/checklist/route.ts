import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getLaunchReadiness } from "@/lib/launch-readiness";

export async function GET() { return guarded(async () => { const { agency } = await getCurrentUser(); return getLaunchReadiness(agency.id); }); }
