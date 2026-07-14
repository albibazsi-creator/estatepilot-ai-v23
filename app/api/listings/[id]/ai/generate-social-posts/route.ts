import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSocialContent } from "@/lib/ai";
import { getCurrentUser } from "@/lib/current-user";
import { audit } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { aiOutputs: { where: { outputType: "image_analysis" }, orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  const content = await generateSocialContent(listing, listing.aiOutputs[0]?.contentJson);
  const output = await prisma.aiOutput.create({ data: { listingId: id, outputType: "social_posts", contentJson: content as object, modelUsed: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock" } });
  await audit("ai_social_generated", "AiOutput", output.id, { listingId: id }, user.id);
  return NextResponse.json(output);
}
