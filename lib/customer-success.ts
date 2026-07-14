import { prisma } from "@/lib/prisma";

export async function calculateAgencyHealth(agencyId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [activeListings, publishedListings, leadCount30d, hotLeadCount30d, reportCount30d, openTickets] = await Promise.all([
    prisma.listing.count({ where: { agencyId, status: { not: "ARCHIVED" } } }),
    prisma.listing.count({ where: { agencyId, isPublished: true } }),
    prisma.lead.count({ where: { listing: { agencyId }, createdAt: { gte: since } } }),
    prisma.lead.count({ where: { listing: { agencyId }, leadScore: { gte: 81 }, createdAt: { gte: since } } }),
    prisma.sellerReport.count({ where: { listing: { agencyId }, createdAt: { gte: since } } }),
    prisma.supportTicket.count({ where: { agencyId, status: { in: ["open", "waiting"] } } })
  ]);

  let score = 35;
  score += Math.min(20, activeListings * 5);
  score += Math.min(20, publishedListings * 7);
  score += Math.min(15, leadCount30d * 3);
  score += Math.min(15, hotLeadCount30d * 5);
  score += Math.min(10, reportCount30d * 5);
  score -= Math.min(20, openTickets * 5);
  score = Math.max(0, Math.min(100, score));

  const riskSignals = [] as string[];
  if (activeListings === 0) riskSignals.push("Nincs aktív listing");
  if (publishedListings === 0) riskSignals.push("Nincs publikált listing");
  if (leadCount30d === 0) riskSignals.push("Nincs lead az elmúlt 30 napban");
  if (openTickets > 2) riskSignals.push("Sok nyitott support ticket");

  const expansionSignals = [] as string[];
  if (publishedListings >= 3) expansionSignals.push("Több aktív landing oldal");
  if (hotLeadCount30d >= 2) expansionSignals.push("Erős lead aktivitás");
  if (reportCount30d >= 2) expansionSignals.push("Tulajdonosi riport használat");

  const nextAction = riskSignals[0] ?? (expansionSignals.length ? "Ajánlj Pro/Agency csomagot és white-label domaint." : "Kérj visszajelzést az első demo után.");

  return prisma.customerSuccessHealth.create({
    data: {
      agencyId,
      healthScore: score,
      plan: "manual-pro",
      lifecycleStage: score >= 80 ? "growth" : score >= 55 ? "activated" : "onboarding",
      activeListings,
      publishedListings,
      leadCount30d,
      hotLeadCount30d,
      reportCount30d,
      riskSignalsJson: riskSignals,
      expansionSignalsJson: expansionSignals,
      nextAction
    }
  });
}
