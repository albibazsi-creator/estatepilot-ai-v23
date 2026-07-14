import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { media: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const candidates = listing.media
    .filter((media) => media.mediaType === "IMAGE")
    .map((media) => ({
      mediaId: media.id,
      roomLabel: media.roomLabel ?? "ismeretlen helyiség",
      recommendation: media.qualityScore && media.qualityScore < 72 ? "Előbb fotóminőség-javítás, utána virtual staging." : "Stagingre alkalmas lehet, ha üres vagy rendezetlen a tér.",
      allowedEdits: ["fénykorrekció", "enyhe declutter", "virtuális bútorozás"],
      forbiddenEdits: ["fal/ajtó/ablak áthelyezése", "kilátás meghamisítása", "komoly hiba eltüntetése"],
      disclosure: "AI látványterv"
    }));

  const plan = {
    listingId: listing.id,
    policy: "Minden stagingelt képen kötelező jelölni, hogy AI látványterv. Az eredeti kép megmarad.",
    candidates,
    styles: ["modern minimal", "skandináv", "luxury", "családias"],
    nextStep: "Következő integráció: külső staging API / image generation provider bekötése mediaId alapján."
  };

  const output = await prisma.aiOutput.create({ data: { listingId: id, outputType: "staging_plan", contentJson: plan } });
  await audit("staging_plan_generated", "AiOutput", output.id, { listingId: id, candidates: candidates.length }, user.id);
  return NextResponse.json(output);
}
