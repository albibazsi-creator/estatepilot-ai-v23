import { prisma } from "@/lib/prisma";
import { runConfigDoctor, summarizeDoctor } from "@/lib/config-doctor";

export async function buildReleaseReadiness() {
  const checks = runConfigDoctor();
  const summary = summarizeDoctor(checks);
  const [listings, publishedListings, leads, openQualityIssues, failedJobs, failedExports, criticalSecurityEvents] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { isPublished: true } }),
    prisma.lead.count(),
    prisma.dataQualityIssue.count({ where: { status: "open", severity: { in: ["critical", "warning"] } } }),
    prisma.aiJob.count({ where: { status: "FAILED" } }),
    prisma.portalExport.count({ where: { status: "FAILED" } }),
    prisma.securityEvent.count({ where: { severity: "critical", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
  ]);

  const blockers = [
    summary.errors > 0 ? `${summary.errors} konfigurációs hiba` : null,
    listings === 0 ? "nincs demo listing" : null,
    publishedListings === 0 ? "nincs publikált listing" : null,
    openQualityIssues > 0 ? `${openQualityIssues} nyitott kritikus/warning data-quality issue` : null,
    failedJobs > 0 ? `${failedJobs} failed AI job` : null,
    failedExports > 0 ? `${failedExports} failed portal export` : null,
    criticalSecurityEvents > 0 ? `${criticalSecurityEvents} kritikus security esemény az elmúlt 7 napban` : null
  ].filter(Boolean);

  const score = Math.max(0, Math.min(100, summary.score - openQualityIssues * 2 - failedJobs * 4 - failedExports * 3 - criticalSecurityEvents * 10));
  return {
    ready: blockers.length === 0 && score >= 80,
    score,
    blockers,
    counts: { listings, publishedListings, leads, openQualityIssues, failedJobs, failedExports, criticalSecurityEvents },
    config: summary,
    checks
  };
}
