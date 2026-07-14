import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";
import { calculateListingReadiness } from "@/lib/readiness";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, agencyId: agency.id },
    include: { media: true, tours: true, floorplans: true, leads: true, aiOutputs: true }
  });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const readiness = calculateListingReadiness(listing);
  const output = {
    score: readiness.score,
    grade: readiness.status,
    wins: readiness.wins,
    missing: readiness.missing,
    next_actions: readiness.missing.map((item) => `Pótold: ${item}`),
    lead_activity_bonus: Math.min(15, listing.leads.length * 5),
    ai_outputs: listing.aiOutputs.length
  };

  await prisma.listing.update({ where: { id }, data: { aiReadinessScore: readiness.score } });
  const aiOutput = await prisma.aiOutput.create({ data: { listingId: id, outputType: "listing_conversion_score", contentJson: output } });
  await audit("listing_score_analyzed", "AiOutput", aiOutput.id, { listingId: id, score: readiness.score }, user.id);
  return NextResponse.json(aiOutput);
}
