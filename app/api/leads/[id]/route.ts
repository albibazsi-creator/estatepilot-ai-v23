import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { listing: true, events: true, appointments: true } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      status: body.status,
      message: body.message,
      buyingIntent: body.buyingIntent,
      financingType: body.financingType,
      moveTimeline: body.moveTimeline
    }
  });
  return NextResponse.json(lead);
}
