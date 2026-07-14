import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ok, parseJson, guarded } from "@/lib/api-response";
import { createProductFeedback } from "@/lib/product-feedback";

const schema = z.object({ category: z.string().default("general"), score: z.number().int().min(0).max(10).optional(), message: z.string().min(3), source: z.string().default("dashboard") });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const feedback = await prisma.productFeedback.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
    return { feedback };
  });
}

export async function POST(req: Request) {
  const { user, agency } = await getCurrentUser();
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const feedback = await createProductFeedback({ agencyId: agency.id, userEmail: user.email, ...parsed.data });
  return ok({ feedback }, { status: 201 });
}
