import { prisma } from "@/lib/prisma";

export async function ensureRetentionPolicies(agencyId: string) {
  const policies = [
    { dataCategory: "leads", retentionDays: Number(process.env.V11_RETENTION_DAYS_LEADS ?? 730), legalBasis: "contract_preparation", action: "review_before_delete" },
    { dataCategory: "raw_chat", retentionDays: Number(process.env.V11_RETENTION_DAYS_RAW_CHAT ?? 180), legalBasis: "legitimate_interest", action: "anonymize" },
    { dataCategory: "audit_logs", retentionDays: Number(process.env.V11_RETENTION_DAYS_AUDIT ?? 2555), legalBasis: "legal_obligation", action: "retain" },
    { dataCategory: "ai_traces", retentionDays: 365, legalBasis: "legitimate_interest", action: "summarize_then_delete_raw" }
  ];
  for (const policy of policies) {
    await prisma.dataRetentionPolicy.upsert({ where: { agencyId_dataCategory: { agencyId, dataCategory: policy.dataCategory } }, update: {}, create: { agencyId, ...policy } });
  }
  return prisma.dataRetentionPolicy.findMany({ where: { agencyId }, orderBy: { dataCategory: "asc" } });
}

export async function createRetentionDryRun(agencyId: string) {
  const policies = await ensureRetentionPolicies(agencyId);
  const summary = { mode: "dry_run", policies: policies.length, candidates: { leads: 0, rawChat: 0, aiTraces: 0 }, recommendation: "Éles törlés előtt DSR/export ellenőrzés szükséges." };
  return prisma.dataRetentionRun.create({ data: { agencyId, mode: "dry_run", status: "completed", summaryJson: summary } });
}
