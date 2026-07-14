import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ok, parseJson, guarded } from "@/lib/api-response";
import { recordAiDecision } from "@/lib/ai-governance";

const schema = z.object({
  listingId: z.string().optional(),
  leadId: z.string().optional(),
  decisionType: z.string().min(2),
  explanation: z.string().min(5),
  confidence: z.number().int().min(0).max(100).optional(),
  riskLevel: z.string().optional(),
  outputJson: z.record(z.unknown()).default({})
});

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const decisions = await prisma.aiDecisionLog.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
    return { decisions };
  });
}

export async function POST(req: Request) {
  const { user, agency } = await getCurrentUser();
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const decision = await recordAiDecision({ agencyId: agency.id, actorUserId: user.id, ...parsed.data });
  return ok({ decision }, { status: 201 });
}
