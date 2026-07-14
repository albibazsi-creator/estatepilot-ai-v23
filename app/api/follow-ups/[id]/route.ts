import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await getCurrentUser();
  const { id } = await params;
  const body = await req.json();
  const task = await prisma.followUpTask.update({
    where: { id },
    data: {
      status: body.status,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      priority: typeof body.priority === "number" ? body.priority : undefined,
      description: body.description,
      title: body.title
    }
  });
  return NextResponse.json(task);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await getCurrentUser();
  const { id } = await params;
  await prisma.followUpTask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
