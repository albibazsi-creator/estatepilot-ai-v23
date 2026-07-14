import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { appointmentNotificationHtml, sendTrackedEmail } from "@/lib/notifications";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  leadId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ip = getClientIp(req);
  const limited = rateLimit(`book:${ip}`, 10, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Túl sok időpontkérés rövid időn belül." }, { status: 429 });

  const { slug } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { slug }, include: { agent: true } });
  if (!listing || !listing.isPublished) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId }, include: { events: true } });
  if (!lead || lead.listingId !== listing.id) return NextResponse.json({ error: "Lead not found for listing" }, { status: 404 });

  const startTime = new Date(parsed.data.startTime);
  const endTime = new Date(parsed.data.endTime);
  if (endTime <= startTime) return NextResponse.json({ error: "Az időpont vége nem lehet korábbi, mint a kezdete." }, { status: 400 });

  const appointment = await prisma.appointment.create({
    data: {
      leadId: parsed.data.leadId,
      listingId: listing.id,
      agentId: listing.agentId,
      startTime,
      endTime,
      status: "PENDING"
    }
  });

  const score = calculateLeadScore({ ...lead, events: [...lead.events, { eventType: "booking_created" }] });
  await prisma.lead.update({ where: { id: lead.id }, data: { leadScore: score.score, status: "BOOKED", aiSummary: `${score.temperature}: ${score.reason}. Következő lépés: ${score.nextBestAction}` } });
  const metadata: Record<string, unknown> = { appointmentId: appointment.id, score };
  if (ip !== "unknown") metadata.ip = ip.slice(0, 64);
  await prisma.leadEvent.create({ data: { leadId: lead.id, listingId: listing.id, eventType: "booking_created", metadataJson: metadata } });

  const email = await sendTrackedEmail({
    agencyId: listing.agencyId,
    listingId: listing.id,
    leadId: lead.id,
    to: listing.agent.email,
    subject: `Új megtekintési időpont: ${listing.title}`,
    html: appointmentNotificationHtml({
      leadName: lead.name,
      listingTitle: listing.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    })
  });

  return NextResponse.json({ appointment, score, email }, { status: 201 });
}
