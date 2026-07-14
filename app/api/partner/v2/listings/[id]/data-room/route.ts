import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id }, include: { media: true, tours: true, floorplans: true, sellerReports: { take: 1, orderBy: { createdAt: "desc" } } } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.partnerApiRequestLog.create({ data: { agencyId: listing.agencyId, endpoint: "/api/partner/v2/listings/:id/data-room", method: "GET", statusCode: 200 } });
  return NextResponse.json({
    id: listing.id,
    title: listing.title,
    publicFacts: { city: listing.city, district: listing.district, price: listing.price, sizeM2: listing.sizeM2, rooms: listing.rooms, propertyType: listing.propertyType },
    media: listing.media.map((m) => ({ type: m.mediaType, url: m.url, roomLabel: m.roomLabel, isStaged: m.isStaged, disclosureRequired: m.disclosureRequired })),
    tours: listing.tours.map((t) => ({ type: t.tourType, provider: t.provider, embedUrl: t.embedUrl })),
    floorplans: listing.floorplans.map((f) => ({ type: f.type, fileUrl: f.fileUrl })),
    latestReport: listing.sellerReports[0] ? { periodStart: listing.sellerReports[0].periodStart, periodEnd: listing.sellerReports[0].periodEnd, summary: listing.sellerReports[0].aiSummary } : null
  });
}
