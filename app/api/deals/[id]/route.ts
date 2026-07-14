import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded, parseJson } from "@/lib/api-response";

const patchSchema = z.object({ stage: z.string().optional(), probability: z.number().int().min(0).max(100).optional(), nextStep: z.string().optional(), riskLevel: z.string().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const { id } = await params;
    const { data, error } = await parseJson(req, patchSchema);
    if (error) return error;
    const existing = await prisma.dealPipelineItem.findFirst({ where: { id, agencyId: agency.id } });
    if (!existing) throw new Error("Deal not found");
    return prisma.dealPipelineItem.update({ where: { id }, data });
  });
}
