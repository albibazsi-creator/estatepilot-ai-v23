import { prisma } from "@/lib/prisma";
import { guarded } from "@/lib/api-response";
import { buildPublishChecklist } from "@/lib/compliance";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  return guarded(async () => {
    const { slug } = await params;
    const listing = await prisma.listing.findUnique({ where: { slug }, include: { media: true, tours: true, floorplans: true } });
    if (!listing || !listing.isPublished) throw new Error("Listing not found");
    return {
      listing: {
        title: listing.title,
        city: listing.city,
        district: listing.district,
        price: listing.price,
        currency: listing.currency,
        sizeM2: listing.sizeM2,
        rooms: listing.rooms,
        condition: listing.condition,
        descriptionAi: listing.descriptionAi
      },
      media: listing.media.filter((m) => !m.disclosureRequired || m.isStaged).map((m) => ({ type: m.mediaType, url: m.url, roomLabel: m.roomLabel, isStaged: m.isStaged, disclosureRequired: m.disclosureRequired })),
      tours: listing.tours.map((t) => ({ type: t.tourType, provider: t.provider, status: t.status, embedUrl: t.embedUrl })),
      floorplans: listing.floorplans.map((f) => ({ type: f.type, status: f.status, fileUrl: f.fileUrl })),
      compliance: buildPublishChecklist(listing)
    };
  });
}
