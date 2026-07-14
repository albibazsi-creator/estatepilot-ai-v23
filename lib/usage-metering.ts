import { prisma } from "@/lib/prisma";

type MeterEvent = {
  agencyId?: string | null;
  listingId?: string | null;
  leadId?: string | null;
  featureKey: string;
  quantity?: number;
  unit?: string;
  estimatedCostHuf?: number;
  source?: string;
  metadataJson?: any;
};

export async function recordUsage(event: MeterEvent) {
  return prisma.usageMeterRecord.create({
    data: {
      agencyId: event.agencyId ?? null,
      listingId: event.listingId ?? null,
      leadId: event.leadId ?? null,
      featureKey: event.featureKey,
      quantity: event.quantity ?? 1,
      unit: event.unit ?? "event",
      estimatedCostHuf: event.estimatedCostHuf ?? 0,
      source: event.source ?? "system",
      metadataJson: event.metadataJson ?? undefined
    }
  });
}

export async function seedUsageFromExistingData(agencyId?: string | null) {
  const listings = await prisma.listing.count({ where: agencyId ? { agencyId } : undefined });
  const leads = await prisma.lead.count({ where: agencyId ? { listing: { agencyId } } : undefined });
  const reports = await prisma.sellerReport.count({ where: agencyId ? { listing: { agencyId } } : undefined });
  const jobs = await prisma.aiJob.count({ where: agencyId ? { agencyId } : undefined });
  const existing = await prisma.usageMeterRecord.count({ where: { agencyId: agencyId ?? null } });
  if (existing === 0) {
    await prisma.usageMeterRecord.createMany({
      data: [
        { agencyId: agencyId ?? null, featureKey: "listing_hosted", quantity: listings, unit: "listing", estimatedCostHuf: listings * 25, source: "seed" },
        { agencyId: agencyId ?? null, featureKey: "lead_capture", quantity: leads, unit: "lead", estimatedCostHuf: leads * 8, source: "seed" },
        { agencyId: agencyId ?? null, featureKey: "seller_report", quantity: reports, unit: "report", estimatedCostHuf: reports * 120, source: "seed" },
        { agencyId: agencyId ?? null, featureKey: "ai_job", quantity: jobs, unit: "job", estimatedCostHuf: jobs * 180, source: "seed" }
      ]
    });
  }
}

export async function getUsageMeteringSummary(agencyId?: string | null) {
  await seedUsageFromExistingData(agencyId);
  const records = await prisma.usageMeterRecord.findMany({ where: { agencyId: agencyId ?? null }, orderBy: { occurredAt: "desc" }, take: 250 });
  const byFeature = new Map<string, { quantity: number; estimatedCostHuf: number; unit: string }>();
  for (const record of records) {
    const current = byFeature.get(record.featureKey) ?? { quantity: 0, estimatedCostHuf: 0, unit: record.unit };
    current.quantity += record.quantity;
    current.estimatedCostHuf += record.estimatedCostHuf;
    byFeature.set(record.featureKey, current);
  }
  const features = Array.from(byFeature.entries()).map(([featureKey, value]) => ({ featureKey, ...value })).sort((a, b) => b.estimatedCostHuf - a.estimatedCostHuf);
  const totalCostHuf = features.reduce((sum, feature) => sum + feature.estimatedCostHuf, 0);
  const billableEvents = features.reduce((sum, feature) => sum + feature.quantity, 0);
  const score = records.length > 0 ? Math.min(100, 65 + features.length * 7) : 20;
  return { records, features, totalCostHuf, billableEvents, score, status: records.length ? "tracking" : "empty" };
}
