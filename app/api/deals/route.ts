import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded, parseJson } from "@/lib/api-response";
import { groupPipeline, syncDealsForAgency } from "@/lib/deal-pipeline";

const createSchema = z.object({ listingId: z.string().optional(), leadId: z.string().optional(), title: z.string().min(3), stage: z.string().default("new_lead"), probability: z.number().int().min(0).max(100).default(15), forecastValue: z.number().int().default(0) });

export async function GET(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const url = new URL(req.url);
    if (url.searchParams.get("sync") === "1") await syncDealsForAgency(agency.id);
    const items = await prisma.dealPipelineItem.findMany({ where: { agencyId: agency.id }, orderBy: [{ probability: "desc" }, { updatedAt: "desc" }] });
    return { items, summary: groupPipeline(items) };
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency, user } = await getCurrentUser();
    const { data, error } = await parseJson(req, createSchema);
    if (error) return error;
    return prisma.dealPipelineItem.create({ data: { ...data, agencyId: agency.id, ownerUserId: user.id } });
  });
}
