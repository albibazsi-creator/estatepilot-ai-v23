import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLeadScore } from "@/lib/lead-scoring";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { events: true } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  const score = calculateLeadScore(lead);
  const updated = await prisma.lead.update({ where: { id }, data: { leadScore: score.score } });
  return NextResponse.json({ lead: updated, score });
}
