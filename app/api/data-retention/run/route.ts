import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { createRetentionDryRun, ensureRetentionPolicies } from "@/lib/data-retention";

export async function GET() { return guarded(async () => { const { agency } = await getCurrentUser(); return { policies: await ensureRetentionPolicies(agency.id) }; }); }
export async function POST() { return guarded(async () => { const { agency } = await getCurrentUser(); return { run: await createRetentionDryRun(agency.id) }; }); }
