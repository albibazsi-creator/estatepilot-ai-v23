import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { agency } = await getCurrentUser();
  const { id } = await params;
  const campaign = await prisma.marketingCampaign.findFirst({ where: { id, agencyId: agency.id }, include: { listing: true } });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { agency } = await getCurrentUser();
  const { id } = await params;
  const existing = await prisma.marketingCampaign.findFirst({ where: { id, agencyId: agency.id } });
  if (!existing) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  const body = await req.json();
  const campaign = await prisma.marketingCampaign.update({
    where: { id },
    data: {
      status: body.status,
      name: body.name,
      objective: body.objective
    }
  });
  return NextResponse.json(campaign);
}
