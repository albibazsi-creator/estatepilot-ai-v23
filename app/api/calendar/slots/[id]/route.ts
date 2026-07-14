import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { buildAppointmentIcs } from "@/lib/calendar";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.calendarSlot.findFirst({ where: { id, agentId: user.id } });
  if (!existing) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  const slot = await prisma.calendarSlot.update({
    where: { id },
    data: {
      status: body.status,
      note: body.note,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined
    }
  });
  return NextResponse.json(slot);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const slot = await prisma.calendarSlot.findFirst({ where: { id, agentId: user.id }, include: { listing: true } });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

  const ics = buildAppointmentIcs({
    title: `EstatePilot megtekintés${slot.listing ? ` - ${slot.listing.title}` : ""}`,
    description: slot.note ?? "EstatePilot AI időpont slot",
    location: slot.listing?.addressOptional ?? slot.listing?.city ?? undefined,
    start: slot.startTime,
    end: slot.endTime
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=estatepilot-slot-${slot.id}.ics`
    }
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const existing = await prisma.calendarSlot.findFirst({ where: { id, agentId: user.id } });
  if (!existing) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  await prisma.calendarSlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
