import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { persistDataQualityIssues } from "@/lib/data-quality";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { agency } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findFirst({ where: { id, agencyId: agency.id }, include: { media: true, tours: true, floorplans: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  const report = await persistDataQualityIssues({ agencyId: agency.id, listing });
  return NextResponse.json(report);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { agency } = await getCurrentUser();
  const { id } = await params;
  const issues = await prisma.dataQualityIssue.findMany({ where: { agencyId: agency.id, listingId: id, status: "open" }, orderBy: [{ severity: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ issues });
}
