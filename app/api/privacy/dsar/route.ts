import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ok, parseJson, guarded } from "@/lib/api-response";
import { createDataSubjectRequest, completeDataSubjectExport, markDeletionPlanned } from "@/lib/privacy-dsr";

const schema = z.object({ requesterEmail: z.string().email(), requesterName: z.string().optional(), requestType: z.enum(["export", "delete", "rectify"]).default("export"), notes: z.string().optional() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const requests = await prisma.dataSubjectRequest.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
    return { requests };
  });
}

export async function POST(req: Request) {
  const { agency } = await getCurrentUser();
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const request = await createDataSubjectRequest({ agencyId: agency.id, ...parsed.data });
  if (parsed.data.requestType === "export") {
    const completed = await completeDataSubjectExport(request.id, agency.id);
    return ok({ request: completed }, { status: 201 });
  }
  if (parsed.data.requestType === "delete") {
    const planned = await markDeletionPlanned(request.id, "Manual anonymization review before destructive action.");
    return ok({ request: planned }, { status: 201 });
  }
  return ok({ request }, { status: 201 });
}
