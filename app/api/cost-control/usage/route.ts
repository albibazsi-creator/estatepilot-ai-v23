import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { recordAiUsageEvent } from "@/lib/cost-control";

const schema = z.object({ feature: z.string().min(2), listingId: z.string().optional(), leadId: z.string().optional(), modelName: z.string().optional(), inputTokens: z.number().int().default(0), outputTokens: z.number().int().default(0), estimatedCostHuf: z.number().int().default(0), traceId: z.string().optional(), metadataJson: z.unknown().optional() });
export async function POST(req: Request) { const parsed = await parseJson(req, schema); if (parsed.error) return parsed.error; return guarded(async () => { const { agency } = await getCurrentUser(); const event = await recordAiUsageEvent({ agencyId: agency.id, ...parsed.data }); return { event }; }); }
