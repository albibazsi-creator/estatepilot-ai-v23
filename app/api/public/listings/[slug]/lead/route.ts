import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validators";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { leadNotificationHtml, sendTrackedEmail } from "@/lib/notifications";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { buildFollowUpTasksForLead } from "@/lib/follow-up";
import { recordConsent, CONSENT_TEXTS } from "@/lib/consent";
import { securityEvent } from "@/lib/security-events";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ip = getClientIp(req);
  const limited = rateLimit(`lead:${ip}`, 6, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Túl sok beküldés rövid időn belül." }, { status: 429 });

  const { slug } = await params;
  const body = await req.json();
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { slug }, include: { agent: true, agency: true } });
  if (!listing || !listing.isPublished) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const score = calculateLeadScore(parsed.data);
  const metadata: Record<string, unknown> = { score, gdprConsent: true };
  if (ip !== "unknown") metadata.ip = ip.slice(0, 64);

  const lead = await prisma.lead.create({
    data: {
      listingId: listing.id,
      agentId: listing.agentId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      buyingIntent: parsed.data.buyingIntent,
      financingType: parsed.data.financingType,
      moveTimeline: parsed.data.moveTimeline,
      leadScore: score.score,
      aiSummary: `${score.temperature}: ${score.reason}. Következő lépés: ${score.nextBestAction}`,
      gdprConsentAt: new Date(),
      gdprSource: `public_listing:${slug}`,
      events: {
        create: { listingId: listing.id, eventType: "lead_submit", metadataJson: metadata }
      }
    }
  });

  await recordConsent({
    agencyId: listing.agencyId,
    listingId: listing.id,
    leadId: lead.id,
    purpose: "lead_capture",
    subjectEmail: lead.email,
    subjectPhone: lead.phone,
    source: `public_listing:${slug}`,
    ip,
    userAgent: req.headers.get("user-agent"),
    consentText: CONSENT_TEXTS.lead_capture,
    metadataJson: { leadScore: score.score }
  });

  await securityEvent({ agencyId: listing.agencyId, eventType: "public_lead_created", severity: "info", ip, userAgent: req.headers.get("user-agent"), metadataJson: { listingId: listing.id, leadId: lead.id } });

  const tasks = buildFollowUpTasksForLead({ ...lead, events: [], listing });
  await Promise.all(tasks.map((task) => prisma.followUpTask.create({ data: { ...task, listingId: listing.id, leadId: lead.id, assignedUserId: listing.agentId } })));

  const email = await sendTrackedEmail({
    agencyId: listing.agencyId,
    listingId: listing.id,
    leadId: lead.id,
    to: listing.agent.email,
    subject: `Új ${score.temperature} lead: ${listing.title}`,
    html: leadNotificationHtml({
      leadName: lead.name,
      listingTitle: listing.title,
      score: score.score,
      message: lead.message,
      phone: lead.phone,
      email: lead.email
    })
  });

  return NextResponse.json({ id: lead.id, score, email }, { status: 201 });
}
