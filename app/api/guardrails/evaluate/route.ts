import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { evaluateGuardrails } from "@/lib/chat-guardrails";

export async function POST(req: NextRequest) {
  const { agency } = await getCurrentUser();
  const body = await req.json();
  const message = String(body.message || "");
  const rules = await prisma.chatGuardrailRule.findMany({ where: { OR: [{ agencyId: agency.id }, { agencyId: null }], enabled: true } });
  const result = evaluateGuardrails(message, rules.map((r) => ({ key: r.key, enabled: r.enabled, blockPatterns: r.blockPatterns, safeReply: r.safeReply, severity: r.severity })));
  if (result.blocked) {
    await prisma.chatGuardrailEvent.create({ data: { agencyId: agency.id, listingId: body.listingId || null, sessionId: body.sessionId || null, ruleKey: result.ruleKey || "unknown", userMessage: message, safeReply: result.safeReply || "", metadataJson: { source: "api" } } });
  }
  return NextResponse.json(result);
}
