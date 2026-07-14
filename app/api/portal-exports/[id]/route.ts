import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { agency } = await getCurrentUser();
  const { id } = await params;
  const item = await prisma.portalExport.findFirst({ where: { id, agencyId: agency.id } });
  if (!item) return NextResponse.json({ error: "Export not found" }, { status: 404 });
  await prisma.portalExport.update({ where: { id }, data: { downloadedAt: new Date(), status: item.status === "GENERATED" ? "DOWNLOADED" : item.status } });
  return NextResponse.json(item);
}
