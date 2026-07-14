import { prisma } from "@/lib/prisma";
import { requireListingAccess } from "@/lib/authz";
import { guarded } from "@/lib/api-response";
import { buildPublishChecklist } from "@/lib/compliance";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { id } = await params;
    await requireListingAccess(id);
    const listing = await prisma.listing.findUnique({ where: { id }, include: { media: true, tours: true, floorplans: true } });
    if (!listing) throw new Error("Listing not found");
    return buildPublishChecklist(listing);
  });
}
