import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getLatestTenantBoundaryChecks, runTenantBoundaryAudit } from "@/lib/tenant-boundary";

export async function GET() { return guarded(async () => { const { agency } = await getCurrentUser(); return { checks: await getLatestTenantBoundaryChecks(agency.id) }; }); }
export async function POST() { return guarded(async () => { const { agency } = await getCurrentUser(); return runTenantBoundaryAudit(agency.id); }); }
