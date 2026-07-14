import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { guarded } from "@/lib/api-response";
import { audit } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { id } = await params;
    const { user, agency } = await requireRole("AGENCY_OWNER");
    const apiKey = await prisma.apiKey.findFirst({ where: { id, agencyId: agency.id } });
    if (!apiKey) throw new Error("API key not found");
    const updated = await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
    await audit("api_key_revoked", "ApiKey", id, { prefix: apiKey.prefix }, user.id);
    return { id: updated.id, revokedAt: updated.revokedAt };
  });
}
