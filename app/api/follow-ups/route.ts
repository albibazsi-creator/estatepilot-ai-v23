import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { followUpTaskSchema } from "@/lib/validators";
import { buildFollowUpTasksForLead } from "@/lib/follow-up";

export async function GET() {
  const { user, agency } = await getCurrentUser();
  const tasks = await prisma.followUpTask.findMany({
    where: { OR: [{ assignedUserId: user.id }, { listing: { agencyId: agency.id } }] },
    include: { listing: true, lead: true },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueAt: "asc" }]
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const { user } = await getCurrentUser();
  const body = await req.json();

  if (body.leadId && body.generateFromLead) {
    const lead = await prisma.lead.findUnique({ where: { id: body.leadId }, include: { listing: true, events: true } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const tasks = buildFollowUpTasksForLead(lead);
    const created = await Promise.all(tasks.map((task) => prisma.followUpTask.create({ data: { ...task, listingId: lead.listingId, leadId: lead.id, assignedUserId: lead.agentId } })));
    return NextResponse.json(created, { status: 201 });
  }

  const parsed = followUpTaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const task = await prisma.followUpTask.create({ data: { ...parsed.data, assignedUserId: user.id } });
  return NextResponse.json(task, { status: 201 });
}
