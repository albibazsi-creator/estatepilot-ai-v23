import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";

const schema = z.object({
  roomName: z.string().min(2),
  panoramaUrl: z.string().optional().nullable(),
  positionX: z.coerce.number().optional().nullable(),
  positionY: z.coerce.number().optional().nullable(),
  positionZ: z.coerce.number().optional().nullable(),
  sortOrder: z.coerce.number().int().optional().default(0)
});

export async function GET(_: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const { tourId } = await params;
  const nodes = await prisma.tourNode.findMany({ where: { tourId }, orderBy: { sortOrder: "asc" }, include: { outgoing: true, incoming: true } });
  return NextResponse.json(nodes);
}

export async function POST(req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const { user } = await getCurrentUser();
  const { tourId } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const node = await prisma.tourNode.create({ data: { tourId, ...parsed.data } });
  await audit("tour_node_created", "TourNode", node.id, { tourId }, user.id);
  return NextResponse.json(node, { status: 201 });
}
