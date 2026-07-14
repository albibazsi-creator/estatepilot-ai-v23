import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { calendarSlotSchema } from "@/lib/validators";

export async function GET() {
  const { user } = await getCurrentUser();
  const slots = await prisma.calendarSlot.findMany({
    where: { agentId: user.id },
    include: { listing: true },
    orderBy: { startTime: "asc" }
  });
  return NextResponse.json(slots);
}

export async function POST(req: Request) {
  const { user } = await getCurrentUser();
  const body = await req.json();
  const parsed = calendarSlotSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slot = await prisma.calendarSlot.create({
    data: {
      ...parsed.data,
      agentId: user.id,
      status: "OPEN"
    }
  });
  return NextResponse.json(slot, { status: 201 });
}
