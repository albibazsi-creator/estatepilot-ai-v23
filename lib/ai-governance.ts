import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export function hashPayload(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload ?? {})).digest("hex").slice(0, 32);
}

export async function recordAiDecision(input: {
  agencyId?: string | null;
  listingId?: string | null;
  leadId?: string | null;
  actorUserId?: string | null;
  decisionType: string;
  modelName?: string;
  input?: unknown;
  outputJson: Record<string, unknown>;
  confidence?: number;
  riskLevel?: string;
  explanation: string;
}) {
  return prisma.aiDecisionLog.create({
    data: {
      agencyId: input.agencyId ?? null,
      listingId: input.listingId ?? null,
      leadId: input.leadId ?? null,
      actorUserId: input.actorUserId ?? null,
      decisionType: input.decisionType,
      modelName: input.modelName ?? "mock_or_external",
      inputHash: hashPayload(input.input),
      outputJson: input.outputJson,
      confidence: Math.max(0, Math.min(100, input.confidence ?? 70)),
      riskLevel: input.riskLevel ?? "low",
      explanation: input.explanation
    }
  });
}

export async function getAiDecisionSummary(agencyId: string) {
  const [total, highRisk, pendingApproval, latest] = await Promise.all([
    prisma.aiDecisionLog.count({ where: { agencyId } }),
    prisma.aiDecisionLog.count({ where: { agencyId, riskLevel: { in: ["high", "critical"] } } }),
    prisma.aiDecisionLog.count({ where: { agencyId, riskLevel: { in: ["high", "critical"] }, approvedAt: null } }),
    prisma.aiDecisionLog.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);
  return { total, highRisk, pendingApproval, latest };
}

export function explainLeadScore(score: number, reasons: string[]) {
  const riskLevel = score >= 85 ? "medium" : "low";
  return {
    decisionType: "lead_scoring",
    confidence: Math.min(95, Math.max(55, score)),
    riskLevel,
    explanation: `Lead score ${score}/100. Fő okok: ${reasons.join(", ") || "demo viselkedési jelek"}.`,
    outputJson: { score, reasons, temperature: score >= 81 ? "hot" : score >= 61 ? "warm" : "cold" }
  };
}
