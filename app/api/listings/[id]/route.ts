import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validators";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { media: true, tours: true, leads: true, aiOutputs: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const body = await req.json();
  const parsed = listingSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const listing = await prisma.listing.update({ where: { id }, data: parsed.data });
  await audit("listing_updated", "Listing", listing.id, parsed.data, user.id);
  return NextResponse.json(listing);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  await prisma.listing.delete({ where: { id } });
  await audit("listing_deleted", "Listing", id, undefined, user.id);
  return NextResponse.json({ ok: true });
}
