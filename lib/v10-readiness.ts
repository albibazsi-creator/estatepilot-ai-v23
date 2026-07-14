import { prisma } from "@/lib/prisma";

export async function calculateV10Readiness(agencyId: string) {
  const [decisions, dsr, health, evalRuns, backups, releases, improvements, feedback] = await Promise.all([
    prisma.aiDecisionLog.count({ where: { agencyId } }),
    prisma.dataSubjectRequest.count({ where: { agencyId } }),
    prisma.customerSuccessHealth.count({ where: { agencyId } }),
    prisma.aiEvaluationRun.count({ where: { agencyId } }),
    prisma.backupSnapshot.count({ where: { agencyId } }),
    prisma.releaseChannel.count(),
    prisma.listingImprovementRecommendation.count({ where: { agencyId } }),
    prisma.productFeedback.count({ where: { agencyId } })
  ]);
  const checks = [
    { key: "ai_decision_ledger", label: "AI decision ledger seeded", passed: decisions > 0, count: decisions },
    { key: "privacy_dsr", label: "DSR/privacy request flow seeded", passed: dsr > 0, count: dsr },
    { key: "customer_success", label: "Customer success health calculated", passed: health > 0, count: health },
    { key: "ai_evals", label: "AI eval run available", passed: evalRuns > 0, count: evalRuns },
    { key: "backup_snapshot", label: "Backup snapshot available", passed: backups > 0, count: backups },
    { key: "release_channel", label: "Release channel configured", passed: releases > 0, count: releases },
    { key: "listing_improvements", label: "Listing improvement recs generated", passed: improvements > 0, count: improvements },
    { key: "product_feedback", label: "Feedback loop seeded", passed: feedback > 0, count: feedback }
  ];
  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
  return { score, checks, status: score >= 90 ? "enterprise-demo-ready" : score >= 70 ? "demo-ready" : "needs-work" };
}
