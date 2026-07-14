import { prisma } from "@/lib/prisma";
import { guarded } from "@/lib/api-response";
import { requireApiKey } from "@/lib/api-key-auth";

export async function GET(req: Request) {
  return guarded(async () => {
    const { agency } = await requireApiKey(req, "listings:read");
    const listings = await prisma.listing.findMany({
      where: { agencyId: agency.id },
      include: { media: { where: { isCover: true }, take: 1 }, tours: true },
      orderBy: { updatedAt: "desc" }
    });

    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      city: listing.city,
      district: listing.district,
      price: listing.price,
      currency: listing.currency,
      isPublished: listing.isPublished,
      publicUrl: listing.isPublished ? `/listing/${listing.slug}` : null,
      coverImage: listing.media[0]?.url ?? null,
      hasTour: listing.tours.length > 0
    }));
  });
}
