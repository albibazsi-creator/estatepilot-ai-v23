import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateListingDescription } from "@/lib/ai";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { aiOutputs: { where: { outputType: "image_analysis" }, orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const copy = await generateListingDescription(listing, listing.aiOutputs[0]?.contentJson);
  await prisma.listing.update({ where: { id }, data: { descriptionAi: (copy as any).long_description ?? JSON.stringify(copy) } });
  const output = await prisma.aiOutput.create({ data: { listingId: id, outputType: "listing_description", contentJson: copy as object, modelUsed: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock" } });
  await audit("ai_description_generated", "AiOutput", output.id, { listingId: id }, user.id);
  return NextResponse.json(output);
}
