import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { partnerListingPayload } from "@/lib/partner-contract";

export async function GET(req: NextRequest) {
  const started = Date.now();
  const agencyId = req.nextUrl.searchParams.get("agencyId") || "demo-agency";
  const listings = await prisma.listing.findMany({ where: { agencyId }, include: { media: true, leads: true }, orderBy: { updatedAt: "desc" }, take: 50 });
  await prisma.partnerApiRequestLog.create({ data: { agencyId, endpoint: "/api/partner/v2/listings", method: "GET", statusCode: 200, latencyMs: Date.now() - started, requestHash: "demo-query" } });
  return NextResponse.json({ version: "2026-07-v2", data: listings.map(partnerListingPayload) });
}
