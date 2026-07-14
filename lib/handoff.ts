import { prisma } from "@/lib/prisma";

export async function calculateHandoffScore(agencyId: string) {
  const [listings, leads, reports, jobs, deals, proposals, integrations, featureFlags, securityEvents, qualityIssues] = await Promise.all([
    prisma.listing.count({ where: { agencyId } }),
    prisma.lead.count({ where: { listing: { agencyId } } }),
    prisma.sellerReport.count({ where: { listing: { agencyId } } }),
    prisma.aiJob.count({ where: { agencyId } }),
    prisma.dealPipelineItem.count({ where: { agencyId } }),
    prisma.proposalDraft.count({ where: { agencyId } }),
    prisma.integration.count({ where: { agencyId } }),
    prisma.featureFlag.count({ where: { agencyId } }),
    prisma.securityEvent.count({ where: { agencyId } }),
    prisma.dataQualityIssue.count({ where: { agencyId } })
  ]);
  const checks = [
    { key: "listings", ok: listings > 0, weight: 15 },
    { key: "leads", ok: leads > 0, weight: 10 },
    { key: "reports", ok: reports > 0, weight: 10 },
    { key: "jobs", ok: jobs > 0, weight: 10 },
    { key: "deals", ok: deals > 0, weight: 10 },
    { key: "proposals", ok: proposals > 0, weight: 10 },
    { key: "integrations", ok: integrations > 0, weight: 10 },
    { key: "featureFlags", ok: featureFlags > 0, weight: 5 },
    { key: "securityEvents", ok: securityEvents > 0, weight: 5 },
    { key: "qualityIssues", ok: qualityIssues >= 0, weight: 5 }
  ];
  const score = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
  return { score, checks, counts: { listings, leads, reports, jobs, deals, proposals, integrations, featureFlags, securityEvents, qualityIssues } };
}
