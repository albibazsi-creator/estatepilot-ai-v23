import { prisma } from "@/lib/prisma";

export async function ensureDemoAiBudget(agencyId: string) {
  const periodLabel = new Date().toISOString().slice(0, 7);
  return prisma.aiCostBudget.upsert({
    where: { agencyId_periodLabel: { agencyId, periodLabel } },
    update: {},
    create: {
      agencyId,
      periodLabel,
      monthlyLimit: Number(process.env.V11_MONTHLY_AI_BUDGET_HUF ?? 35000),
      hardLimit: Number(process.env.V11_MONTHLY_AI_BUDGET_HUF ?? 35000) * 2,
      currentSpend: 12450,
      ownerEmail: process.env.DEFAULT_AGENT_EMAIL ?? "demo@estatepilot.ai",
      rulesJson: { stopNonCriticalJobsAtPercent: 100, warnAtPercent: 80, allowMockMode: true }
    }
  });
}

export async function recordAiUsageEvent(input: { agencyId: string; listingId?: string; leadId?: string; feature: string; modelName?: string; inputTokens?: number; outputTokens?: number; estimatedCostHuf?: number; traceId?: string; metadataJson?: unknown }) {
  const event = await prisma.aiUsageEvent.create({ data: {
    agencyId: input.agencyId,
    listingId: input.listingId,
    leadId: input.leadId,
    feature: input.feature,
    modelName: input.modelName ?? "mock-v11",
    inputTokens: input.inputTokens ?? 0,
    outputTokens: input.outputTokens ?? 0,
    estimatedCostHuf: input.estimatedCostHuf ?? 0,
    traceId: input.traceId,
    metadataJson: (input.metadataJson ?? {}) as object
  }});
  const periodLabel = new Date().toISOString().slice(0, 7);
  await prisma.aiCostBudget.upsert({
    where: { agencyId_periodLabel: { agencyId: input.agencyId, periodLabel } },
    update: { currentSpend: { increment: input.estimatedCostHuf ?? 0 } },
    create: { agencyId: input.agencyId, periodLabel, monthlyLimit: 35000, hardLimit: 70000, currentSpend: input.estimatedCostHuf ?? 0 }
  });
  return event;
}

export function budgetStatus(budget: { currentSpend: number; monthlyLimit: number; hardLimit: number; warningThreshold: number }) {
  const percent = budget.monthlyLimit > 0 ? Math.round((budget.currentSpend / budget.monthlyLimit) * 100) : 0;
  const state = budget.currentSpend >= budget.hardLimit ? "blocked" : percent >= 100 ? "over_budget" : percent >= budget.warningThreshold ? "warning" : "healthy";
  return { percent, state, remainingHuf: Math.max(0, budget.monthlyLimit - budget.currentSpend) };
}

export async function getCostControlSummary(agencyId: string) {
  const budget = await ensureDemoAiBudget(agencyId);
  const usage = await prisma.aiUsageEvent.groupBy({ by: ["feature"], where: { agencyId }, _sum: { estimatedCostHuf: true, inputTokens: true, outputTokens: true }, orderBy: { _sum: { estimatedCostHuf: "desc" } } });
  return { budget, status: budgetStatus(budget), usage };
}
