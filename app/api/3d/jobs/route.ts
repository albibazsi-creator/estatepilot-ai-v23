import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { createSpatialProcessingJob } from "@/lib/spatial-v17";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({ listingId: z.string().optional() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const model = (prisma as unknown as { spatialProcessingJob?: { findMany: (args: unknown) => Promise<unknown[]> } }).spatialProcessingJob;
    return { jobs: model ? await model.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 30 }) : [] };
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const parsed = await parseJson(req, CreateSchema);
    if (parsed.error) return parsed.error;
    return createSpatialProcessingJob(agency.id, parsed.data.listingId);
  });
}
