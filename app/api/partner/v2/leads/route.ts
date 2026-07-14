import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

export async function POST(req: NextRequest) {
  const started = Date.now();
  const body = await req.json();
  const listing = await prisma.listing.findUnique({ where: { id: String(body.listingId || "") } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (!body.gdprConsent) return NextResponse.json({ error: "GDPR consent required" }, { status: 400 });
  const score = calculateLeadScore({ phone: body.phone, email: body.email, message: body.message, financingType: body.financingType, moveTimeline: body.moveTimeline, events: [{ eventType: "lead_submit" }] });
  const lead = await prisma.lead.create({ data: { listingId: listing.id, agentId: listing.agentId, name: String(body.name || "Partner lead"), email: body.email || null, phone: body.phone || null, message: body.message || null, source: body.source || "partner_api_v2", financingType: body.financingType || null, moveTimeline: body.moveTimeline || null, leadScore: score.score, gdprConsentAt: new Date(), gdprSource: "partner_api_v2" } });
  await prisma.partnerApiRequestLog.create({ data: { agencyId: listing.agencyId, endpoint: "/api/partner/v2/leads", method: "POST", statusCode: 201, latencyMs: Date.now() - started, requestHash: `lead:${lead.id}` } });
  return NextResponse.json({ leadId: lead.id, score: score.score, temperature: score.temperature }, { status: 201 });
}
