import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeListingImages } from "@/lib/ai";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";
import { calculateListingReadiness } from "@/lib/readiness";
import { env } from "@/lib/env";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findFirst({ where: { id, agencyId: agency.id }, include: { media: true, tours: true, floorplans: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const analysis = await analyzeListingImages(listing, listing.media);

  const rooms = Array.isArray((analysis as { rooms?: unknown[] }).rooms) ? (analysis as { rooms: Array<Record<string, unknown>> }).rooms : [];
  const coverCandidate = rooms.find((room) => room.is_cover_candidate === true)?.image_id;
  if (coverCandidate) await prisma.listingMedia.updateMany({ where: { listingId: id }, data: { isCover: false } });

  for (const room of rooms) {
    if (!room.image_id) continue;
    await prisma.listingMedia.update({
      where: { id: String(room.image_id) },
      data: {
        roomLabel: typeof room.room_type === "string" ? room.room_type : undefined,
        qualityScore: typeof room.quality_score === "number" ? room.quality_score : undefined,
        aiTags: room,
        isCover: coverCandidate === room.image_id
      }
    }).catch(() => null);
  }

  const refreshed = await prisma.listing.findUniqueOrThrow({ where: { id }, include: { media: true, tours: true, floorplans: true } });
  const readiness = calculateListingReadiness(refreshed);
  await prisma.listing.update({ where: { id }, data: { aiReadinessScore: readiness.score } });

  const output = await prisma.aiOutput.create({
    data: { listingId: id, outputType: "image_analysis", contentJson: { ...(analysis as object), readiness }, modelUsed: env.OPENAI_API_KEY ? env.OPENAI_MODEL_VISION : "mock" }
  });
  await audit("image_analysis_completed", "AiOutput", output.id, { listingId: id, readiness }, user.id);
  return NextResponse.json(output);
}
