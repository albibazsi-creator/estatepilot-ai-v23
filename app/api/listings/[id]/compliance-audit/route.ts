import { prisma } from "@/lib/prisma";
import { requireListingAccess } from "@/lib/authz";
import { guarded } from "@/lib/api-response";
import { buildComplianceAudit } from "@/lib/compliance";
import { audit } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { id } = await params;
    const { user } = await requireListingAccess(id);
    const listing = await prisma.listing.findUnique({ where: { id }, include: { media: true, tours: true, floorplans: true } });
    if (!listing) throw new Error("Listing not found");
    const result = buildComplianceAudit(listing);
    const aiOutput = await prisma.aiOutput.create({ data: { listingId: id, outputType: "compliance_audit", contentJson: result, modelUsed: "rules-v5" } });
    await audit("compliance_audit_created", "Listing", id, { score: result.checklist.score }, user.id);
    return { aiOutputId: aiOutput.id, ...result };
  });
}
