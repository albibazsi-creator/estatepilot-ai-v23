import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded } from "@/lib/api-response";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return prisma.proposalDraft.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
  });
}
