import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: { media: true, tours: true, floorplans: true, agent: { select: { name: true, email: true } } }
  });
  if (!listing || !listing.isPublished) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  return NextResponse.json(listing);
}
