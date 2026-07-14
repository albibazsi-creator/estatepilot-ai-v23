import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reports = await prisma.sellerReport.findMany({ where: { listingId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(reports);
}
