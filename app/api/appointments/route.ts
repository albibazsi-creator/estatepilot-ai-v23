import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const schema = z.object({
  leadId: z.string(),
  listingId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
});

export async function GET() {
  const { user } = await getCurrentUser();
  const appointments = await prisma.appointment.findMany({ where: { agentId: user.id }, include: { lead: true, listing: true }, orderBy: { startTime: "asc" } });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const { user } = await getCurrentUser();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const appointment = await prisma.appointment.create({
    data: {
      agentId: user.id,
      leadId: parsed.data.leadId,
      listingId: parsed.data.listingId,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
      status: "PENDING"
    }
  });
  return NextResponse.json(appointment, { status: 201 });
}
