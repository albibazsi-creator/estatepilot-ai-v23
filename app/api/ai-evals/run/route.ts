import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ok, parseJson, guarded } from "@/lib/api-response";
import { runDemoAiEvaluation } from "@/lib/ai-evals";

const schema = z.object({ listingId: z.string().optional() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const runs = await prisma.aiEvaluationRun.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 30 });
    const cases = await prisma.aiEvaluationCase.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 80 });
    return { runs, cases };
  });
}

export async function POST(req: Request) {
  const { agency } = await getCurrentUser();
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const run = await runDemoAiEvaluation(agency.id, parsed.data.listingId);
  return ok({ run }, { status: 201 });
}
