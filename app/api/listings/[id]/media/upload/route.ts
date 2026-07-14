import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mediaSchema } from "@/lib/validators";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";
import { inferMediaType, storeUpload } from "@/lib/storage";

export const runtime = "nodejs";

async function handleMultipart(req: Request, listingId: string, userId: string) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Hiányzik a feltöltendő fájl." }, { status: 400 });
    }

    const explicitType = String(form.get("mediaType") ?? "");
    const mediaType = inferMediaType(file.type, explicitType) as "IMAGE" | "VIDEO" | "PANORAMA_360" | "FLOORPLAN";
    const roomLabel = String(form.get("roomLabel") ?? "").trim() || undefined;
    const isCover = form.get("isCover") === "on" || form.get("isCover") === "true";
    const sortOrderRaw = Number(form.get("sortOrder") ?? 0);
    const sortOrder = Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0;
    const stored = await storeUpload({ listingId, file });

    if (isCover) {
      await prisma.listingMedia.updateMany({ where: { listingId }, data: { isCover: false } });
    }

    const media = await prisma.listingMedia.create({
      data: {
        listingId,
        mediaType,
        url: stored.publicUrl,
        originalUrl: stored.publicUrl,
        thumbnailUrl: mediaType === "IMAGE" || mediaType === "PANORAMA_360" ? stored.publicUrl : undefined,
        storageProvider: stored.storageProvider,
        storageKey: stored.storageKey,
        fileSizeBytes: stored.fileSizeBytes,
        mimeType: stored.mimeType,
        roomLabel,
        isCover,
        sortOrder
      }
    });

    await audit("media_file_uploaded", "ListingMedia", media.id, { listingId, filename: file.name, size: file.size, mime: file.type, storageKey: stored.storageKey }, userId);
    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}

async function handleJson(req: Request, listingId: string, userId: string) {
  const body = await req.json();
  const parsed = mediaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.isCover) {
    await prisma.listingMedia.updateMany({ where: { listingId }, data: { isCover: false } });
  }

  const media = await prisma.listingMedia.create({
    data: {
      listingId,
      mediaType: parsed.data.mediaType,
      url: parsed.data.url,
      originalUrl: parsed.data.url,
      thumbnailUrl: parsed.data.thumbnailUrl ?? parsed.data.url,
      storageProvider: parsed.data.url.startsWith("/uploads/") ? "local" : "external",
      roomLabel: parsed.data.roomLabel,
      isCover: parsed.data.isCover,
      sortOrder: parsed.data.sortOrder
    }
  });
  await audit("media_url_added", "ListingMedia", media.id, { listingId }, userId);
  return NextResponse.json(media, { status: 201 });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, agency } = await getCurrentUser();
  const { id } = await params;

  const listing = await prisma.listing.findFirst({ where: { id, agencyId: agency.id }, select: { id: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    return handleMultipart(req, id, user.id);
  }

  return handleJson(req, id, user.id);
}
