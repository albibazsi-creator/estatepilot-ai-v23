import { prisma } from "@/lib/prisma";

export type PipelineStage = "new_lead" | "qualified" | "viewing_booked" | "offer_prepared" | "negotiation" | "won" | "lost";

const stageProbability: Record<PipelineStage, number> = {
  new_lead: 15,
  qualified: 35,
  viewing_booked: 55,
  offer_prepared: 70,
  negotiation: 82,
  won: 100,
  lost: 0
};

export function inferDealStage(lead: { status?: string | null; leadScore?: number | null; appointments?: unknown[]; message?: string | null }): PipelineStage {
  if (lead.status === "WON") return "won";
  if (lead.status === "LOST") return "lost";
  if (lead.status === "OFFER") return "offer_prepared";
  if (lead.status === "BOOKED" || (lead.appointments?.length ?? 0) > 0) return "viewing_booked";
  if ((lead.leadScore ?? 0) >= 61) return "qualified";
  return "new_lead";
}

export function forecastDealValue(input: { listingPrice?: number | null; leadScore?: number | null; stage?: PipelineStage; commissionRate?: number }) {
  const listingPrice = input.listingPrice ?? 0;
  const commissionRate = input.commissionRate ?? 0.025;
  const stage = input.stage ?? "new_lead";
  const probability = Math.max(stageProbability[stage] ?? 10, Math.min(95, input.leadScore ?? 0));
  const grossCommission = Math.round(listingPrice * commissionRate);
  const forecastValue = Math.round(grossCommission * (probability / 100));
  return { probability, grossCommission, forecastValue };
}

export async function syncDealsForAgency(agencyId: string) {
  const leads = await prisma.lead.findMany({
    where: { listing: { agencyId } },
    include: { listing: true, appointments: true },
    orderBy: { createdAt: "desc" }
  });

  const results = [];
  for (const lead of leads) {
    const stage = inferDealStage(lead);
    const forecast = forecastDealValue({ listingPrice: lead.listing.price, leadScore: lead.leadScore, stage });
    const title = `${lead.name} • ${lead.listing.title}`;
    const existing = await prisma.dealPipelineItem.findFirst({ where: { agencyId, leadId: lead.id } });
    const data = {
      agencyId,
      listingId: lead.listingId,
      leadId: lead.id,
      ownerUserId: lead.agentId,
      title,
      stage,
      probability: forecast.probability,
      forecastValue: forecast.forecastValue,
      currency: lead.listing.currency,
      nextStep: stage === "viewing_booked" ? "Megtekintés után ajánlatkérdés és döntési akadályok tisztázása." : "Telefonos kvalifikáció és konkrét megtekintési időpont ajánlása.",
      riskLevel: forecast.probability >= 70 ? "low" : forecast.probability >= 35 ? "medium" : "high",
      aiRecommendation: `Lead score: ${lead.leadScore}/100. Következő lépés: gyors kapcsolatfelvétel és személyes megtekintés felé terelés.`,
      metadataJson: { leadScore: lead.leadScore, grossCommission: forecast.grossCommission }
    };
    const item = existing
      ? await prisma.dealPipelineItem.update({ where: { id: existing.id }, data })
      : await prisma.dealPipelineItem.create({ data });
    results.push(item);
  }
  return results;
}

export function groupPipeline(items: { stage: string; forecastValue: number; probability: number }[]) {
  const stages = ["new_lead", "qualified", "viewing_booked", "offer_prepared", "negotiation", "won", "lost"];
  return stages.map((stage) => {
    const stageItems = items.filter((item) => item.stage === stage);
    return {
      stage,
      count: stageItems.length,
      forecastValue: stageItems.reduce((sum, item) => sum + item.forecastValue, 0),
      avgProbability: stageItems.length ? Math.round(stageItems.reduce((sum, item) => sum + item.probability, 0) / stageItems.length) : 0
    };
  });
}
