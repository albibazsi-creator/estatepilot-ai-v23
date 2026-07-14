import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { listingsToCsv } from "@/lib/exporters";
import { guarded } from "@/lib/api-response";

export async function GET(req: Request) {
  return guarded(async () => {
    const { agency } = await requireRole("AGENT");
    const url = new URL(req.url);
    const format = url.searchParams.get("format") ?? "json";
    const listings = await prisma.listing.findMany({
      where: { agencyId: agency.id },
      include: { leads: true, media: true },
      orderBy: { createdAt: "desc" }
    });

    if (format === "csv") {
      return new Response(listingsToCsv(listings), {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="estatepilot-listings.csv"`
        }
      });
    }

    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      city: listing.city,
      district: listing.district,
      price: listing.price,
      status: listing.status,
      isPublished: listing.isPublished,
      leadCount: listing.leads.length,
      mediaCount: listing.media.length
    }));
  });
}
