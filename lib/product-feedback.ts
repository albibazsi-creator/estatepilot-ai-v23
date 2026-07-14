import { prisma } from "@/lib/prisma";

export function sentimentFromScore(score?: number | null) {
  if (score == null) return "neutral";
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

export async function createProductFeedback(input: { agencyId?: string | null; userEmail?: string | null; category?: string; score?: number | null; message: string; source?: string }) {
  return prisma.productFeedback.create({
    data: {
      agencyId: input.agencyId ?? null,
      userEmail: input.userEmail ?? null,
      category: input.category ?? "general",
      score: input.score ?? null,
      sentiment: sentimentFromScore(input.score),
      message: input.message,
      source: input.source ?? "dashboard"
    }
  });
}
