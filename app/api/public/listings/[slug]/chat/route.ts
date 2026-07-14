import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { answerPropertyQuestion } from "@/lib/ai";
import { answerFromKnowledgeBase } from "@/lib/knowledge";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ question: z.string().min(2).max(500) });

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ip = getClientIp(req);
  const limited = rateLimit(`chat:${ip}`, 20, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Túl sok kérdés rövid időn belül." }, { status: 429 });

  const { slug } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Hiányzó vagy túl hosszú kérdés" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { slug }, include: { media: true, floorplans: true, tours: true } });
  if (!listing || !listing.isPublished) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const metadata: Record<string, unknown> = { question: parsed.data.question };
  if (ip !== "unknown") metadata.ip = ip.slice(0, 64);
  await prisma.leadEvent.create({ data: { listingId: listing.id, eventType: "chat_question", metadataJson: metadata } });

  const ruleAnswer = answerFromKnowledgeBase(parsed.data.question, listing);
  const answer = ruleAnswer.confidence === "high" ? ruleAnswer : await answerPropertyQuestion({
    question: parsed.data.question,
    listing,
    mediaCount: listing.media.length,
    floorplanCount: listing.floorplans.length
  });

  const session = await prisma.chatSession.create({
    data: {
      listingId: listing.id,
      visitorId: ip !== "unknown" ? ip.slice(0, 64) : undefined,
      summary: parsed.data.question,
      messages: {
        create: [
          { role: "user", content: parsed.data.question },
          { role: "assistant", content: String((answer as { answer?: unknown }).answer ?? ""), confidence: String((answer as { confidence?: unknown }).confidence ?? "unknown") }
        ]
      }
    }
  });

  return NextResponse.json({ ...answer, sessionId: session.id });
}
