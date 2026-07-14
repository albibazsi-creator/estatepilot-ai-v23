import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReelsScript } from "@/lib/ai";
import { getCurrentUser } from "@/lib/current-user";
import { audit } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  const script = await generateReelsScript(listing);
  const output = await prisma.aiOutput.create({ data: { listingId: id, outputType: "reels_script", contentJson: script as object, modelUsed: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock" } });
  await audit("ai_reels_generated", "AiOutput", output.id, { listingId: id }, user.id);
  return NextResponse.json(output);
}
