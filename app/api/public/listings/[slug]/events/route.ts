import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validators";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ip = getClientIp(req);
  const limited = rateLimit(`event:${ip}`, 120, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many events" }, { status: 429 });

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { slug }, select: { id: true, isPublished: true } });
  if (!listing || !listing.isPublished) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const metadata: Record<string, unknown> = { ...(parsed.data.metadataJson ?? {}) };
  if (ip !== "unknown") metadata.ip = ip.slice(0, 64);
  const userAgent = req.headers.get("user-agent")?.slice(0, 220);
  if (userAgent) metadata.userAgent = userAgent;

  const event = await prisma.leadEvent.create({
    data: {
      listingId: listing.id,
      leadId: parsed.data.leadId ?? undefined,
      eventType: parsed.data.eventType,
      metadataJson: metadata
    }
  });

  return NextResponse.json({ ok: true, id: event.id });
}
