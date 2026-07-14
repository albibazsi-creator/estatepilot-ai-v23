import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tourSchema } from "@/lib/validators";
import { getCurrentUser } from "@/lib/current-user";
import { audit } from "@/lib/audit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tours = await prisma.tour.findMany({ where: { listingId: id }, include: { nodes: true, hotspots: true } });
  return NextResponse.json(tours);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const body = await req.json();
  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const tour = await prisma.tour.create({
    data: {
      listingId: id,
      tourType: parsed.data.tourType,
      provider: parsed.data.provider,
      embedUrl: parsed.data.embedUrl
    }
  });
  await audit("tour_created", "Tour", tour.id, { listingId: id }, user.id);
  return NextResponse.json(tour, { status: 201 });
}
