import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { generateEnterpriseAuditBundle } from "@/lib/audit-export";

const schema = z.object({ requestedByEmail: z.string().email().optional() });
export async function POST(req: Request) { const parsed = await parseJson(req, schema); if (parsed.error) return parsed.error; return guarded(async () => { const { agency, user } = await getCurrentUser(); const bundle = await generateEnterpriseAuditBundle(agency.id, parsed.data.requestedByEmail ?? user.email); return { bundle }; }); }
