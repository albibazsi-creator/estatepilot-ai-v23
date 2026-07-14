import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { agency } = await getCurrentUser();
  const subscription = await prisma.subscription.findFirst({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ agencyPlan: agency.subscriptionPlan, subscription });
}
