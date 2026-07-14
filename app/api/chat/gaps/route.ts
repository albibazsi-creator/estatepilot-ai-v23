import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded } from "@/lib/api-response";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return prisma.chatKnowledgeGap.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 100 });
  });
}
