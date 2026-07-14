import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { id } = await params;
    const { agency } = await getCurrentUser();
    const jobModel = (prisma as unknown as { spatialProcessingJob?: { findUnique: (args: unknown) => Promise<unknown | null> } }).spatialProcessingJob;
    const eventModel = (prisma as unknown as { spatialProcessingEvent?: { findMany: (args: unknown) => Promise<unknown[]> } }).spatialProcessingEvent;
    const job = jobModel ? await jobModel.findUnique({ where: { id } }) : null;
    if (!job || String((job as Record<string, unknown>).agencyId) !== agency.id) throw new Error("3D processing job not found");
    const events = eventModel ? await eventModel.findMany({ where: { agencyId: agency.id, processingJobId: id }, orderBy: { createdAt: "desc" }, take: 30 }) : [];
    return { job, events };
  });
}
