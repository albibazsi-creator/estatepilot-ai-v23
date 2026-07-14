import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { agency } = await getCurrentUser();
  const events = await prisma.securityEvent.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ events });
}
