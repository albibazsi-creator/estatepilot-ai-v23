import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";

const schema = z.object({
  fromNodeId: z.string(),
  toNodeId: z.string().optional().nullable(),
  label: z.string().min(2),
  yaw: z.coerce.number().optional().nullable(),
  pitch: z.coerce.number().optional().nullable(),
  type: z.string().optional().default("room")
});

export async function GET(_: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const { tourId } = await params;
  const hotspots = await prisma.tourHotspot.findMany({ where: { tourId }, include: { fromNode: true, toNode: true } });
  return NextResponse.json(hotspots);
}

export async function POST(req: Request, { params }: { params: Promise<{ tourId: string }> }) {
  const { user } = await getCurrentUser();
  const { tourId } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const hotspot = await prisma.tourHotspot.create({ data: { tourId, ...parsed.data } });
  await audit("tour_hotspot_created", "TourHotspot", hotspot.id, { tourId }, user.id);
  return NextResponse.json(hotspot, { status: 201 });
}
