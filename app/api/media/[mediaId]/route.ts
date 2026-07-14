import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";

const patchSchema = z.object({
  roomLabel: z.string().optional().nullable(),
  mediaType: z.enum(["IMAGE", "VIDEO", "PANORAMA_360", "FLOORPLAN"]).optional(),
  qualityScore: z.coerce.number().int().min(0).max(100).optional().nullable(),
  isCover: z.boolean().optional(),
  isStaged: z.boolean().optional(),
  disclosureRequired: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional()
});

export async function PATCH(req: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  const { user } = await getCurrentUser();
  const { mediaId } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.listingMedia.findUnique({ where: { id: mediaId } });
  if (!existing) return NextResponse.json({ error: "Media not found" }, { status: 404 });

  if (parsed.data.isCover) {
    await prisma.listingMedia.updateMany({ where: { listingId: existing.listingId }, data: { isCover: false } });
  }

  const media = await prisma.listingMedia.update({ where: { id: mediaId }, data: parsed.data });
  await audit("media_updated", "ListingMedia", media.id, { listingId: media.listingId, changes: parsed.data }, user.id);
  return NextResponse.json(media);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  const { user } = await getCurrentUser();
  const { mediaId } = await params;
  const existing = await prisma.listingMedia.findUnique({ where: { id: mediaId } });
  if (!existing) return NextResponse.json({ error: "Media not found" }, { status: 404 });

  await prisma.listingMedia.delete({ where: { id: mediaId } });
  await audit("media_deleted", "ListingMedia", mediaId, { listingId: existing.listingId }, user.id);
  return NextResponse.json({ ok: true });
}
