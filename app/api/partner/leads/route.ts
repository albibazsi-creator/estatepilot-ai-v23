import { z } from "zod";
import { requireApiKey } from "@/lib/api-key-auth";
import { ok, parseJson, guarded } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";
import { recordConsent, CONSENT_TEXTS } from "@/lib/consent";
import { recordAiDecision } from "@/lib/ai-governance";

const schema = z.object({
  listingSlug: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  buyingIntent: z.string().optional(),
  financingType: z.string().optional(),
  moveTimeline: z.string().optional(),
  gdprConsent: z.boolean()
});

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency, apiKey } = await requireApiKey(req, "leads:write");
    const parsed = await parseJson(req, schema);
    if (parsed.error) return parsed.error;
    if (!parsed.data.gdprConsent) throw new Error("GDPR consent is required for partner lead creation");

    const listing = await prisma.listing.findFirst({ where: { agencyId: agency.id, slug: parsed.data.listingSlug } });
    if (!listing) throw new Error("Listing not found");

    const score = calculateLeadScore(parsed.data);
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
        gdprSource: `partner_api:${apiKey.prefix}`,
        events: { create: { listingId: listing.id, eventType: "lead_submit", metadataJson: { source: "partner_api", apiKeyPrefix: apiKey.prefix, score } } }
      }
    });

    await recordConsent({
      agencyId: agency.id,
      listingId: listing.id,
      leadId: lead.id,
      purpose: "partner_lead_capture",
      subjectEmail: lead.email,
      subjectPhone: lead.phone,
      source: `partner_api:${apiKey.prefix}`,
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent: req.headers.get("user-agent"),
      consentText: CONSENT_TEXTS.lead_capture,
      metadataJson: { leadScore: score.score }
    });

    await recordAiDecision({
      agencyId: agency.id,
      listingId: listing.id,
      leadId: lead.id,
      decisionType: "partner_lead_scoring",
      input: parsed.data,
      outputJson: score,
      confidence: Math.max(55, score.score),
      riskLevel: score.score >= 81 ? "medium" : "low",
      explanation: `Partner API lead scored as ${score.temperature}: ${score.reason}`
    });

    await prisma.partnerApiRequestLog.create({ data: { agencyId: agency.id, apiKeyPrefix: apiKey.prefix, endpoint: "/api/partner/leads", method: "POST", statusCode: 201 } });
    return ok({ leadId: lead.id, score }, { status: 201 });
  });
}
