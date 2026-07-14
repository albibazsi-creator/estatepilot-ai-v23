import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const { user } = await getCurrentUser();
  const leads = await prisma.lead.findMany({ where: { agentId: user.id }, include: { listing: true, events: true }, orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json(leads);
}
