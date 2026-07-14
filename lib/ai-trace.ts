import { prisma } from "@/lib/prisma";

export async function recordAiTrace(input: {
  agencyId?: string | null;
  listingId?: string | null;
  operation: string;
  model?: string | null;
  inputSummary?: string;
  outputSummary?: string;
  status?: "success" | "fallback" | "failed";
  latencyMs?: number;
  tokenUsageJson?: unknown;
  error?: string;
}) {
  try {
    return await prisma.aiTrace.create({
      data: {
        agencyId: input.agencyId ?? null,
        listingId: input.listingId ?? null,
        operation: input.operation,
        model: input.model ?? null,
        inputSummary: input.inputSummary,
        outputSummary: input.outputSummary,
        status: input.status ?? "success",
        latencyMs: input.latencyMs,
        tokenUsageJson: input.tokenUsageJson as any,
        error: input.error
      }
    });
  } catch (error) {
    console.warn("AI trace could not be persisted", error);
    return null;
  }
}
