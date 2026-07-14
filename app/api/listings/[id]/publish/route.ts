import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";
import { calculateListingReadiness } from "@/lib/readiness";
import { buildPublishChecklist } from "@/lib/compliance";
import { persistDataQualityIssues } from "@/lib/data-quality";
import { env } from "@/lib/env";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;
  const existing = await prisma.listing.findFirst({
    where: { id, agencyId: agency.id },
    include: { media: true, tours: true, floorplans: true }
  });

  if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const readiness = calculateListingReadiness(existing);
  const checklist = buildPublishChecklist(existing);
  const quality = await persistDataQualityIssues({ agencyId: agency.id, listing: existing });
  if (env.REQUIRE_PUBLISH_CHECKLIST && (!checklist.canPublish || quality.status === "blocked")) {
    return NextResponse.json({ error: "Publish checklist failed", readiness, checklist, quality }, { status: 422 });
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: { isPublished: true, status: "PUBLISHED", publishedAt: new Date(), aiReadinessScore: readiness.score }
  });
  await audit("listing_published", "Listing", id, { slug: listing.slug, readiness }, user.id);
  return NextResponse.json({ ...listing, readiness, checklist, quality });
}
