import type { Floorplan, Listing, ListingMedia, Tour } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

type ListingExportInput = Listing & { media?: ListingMedia[]; tours?: Tour[]; floorplans?: Floorplan[] };

export function buildPortalPayload(listing: ListingExportInput, targetPortal: string) {
  const images = (listing.media ?? []).filter((m) => m.mediaType === "IMAGE").sort((a, b) => a.sortOrder - b.sortOrder);
  const floorplans = [
    ...(listing.floorplans ?? []).map((f) => f.fileUrl),
    ...(listing.media ?? []).filter((m) => m.mediaType === "FLOORPLAN").map((m) => m.url)
  ];
  const tours = (listing.tours ?? []).map((tour) => ({ type: tour.tourType, provider: tour.provider, embedUrl: tour.embedUrl }));

  return {
    targetPortal,
    exportMode: env.PORTAL_EXPORT_MODE,
    listing: {
      id: listing.id,
      title: listing.title,
      city: listing.city,
      district: listing.district,
      address: listing.addressOptional,
      propertyType: listing.propertyType,
      price: listing.price,
      currency: listing.currency,
      sizeM2: listing.sizeM2,
      rooms: listing.rooms,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      floor: listing.floor,
      condition: listing.condition,
      heating: listing.heating,
      balcony: listing.balcony,
      parking: listing.parking,
      energyRating: listing.energyRating,
      description: listing.descriptionAi || listing.descriptionRaw,
      publicUrl: `${env.NEXT_PUBLIC_APP_URL}/listing/${listing.slug}`
    },
    media: {
      coverImage: images.find((m) => m.isCover)?.url ?? images[0]?.url ?? null,
      images: images.map((m) => ({ url: m.url, roomLabel: m.roomLabel, isStaged: m.isStaged, disclosureRequired: m.disclosureRequired })),
      floorplans,
      tours
    },
    compliance: {
      aiStagingDisclosure: images.some((m) => m.disclosureRequired),
      note: "Portálra küldés előtt az ingatlanosnak jóvá kell hagynia a hirdetést és az AI látványterv jelöléseket."
    }
  };
}

export function validatePortalPayload(payload: ReturnType<typeof buildPortalPayload>) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!payload.listing.title) errors.push("Hiányzó cím.");
  if (!payload.listing.city) errors.push("Hiányzó város.");
  if (!payload.listing.sizeM2) errors.push("Hiányzó alapterület.");
  if (!payload.media.images.length) errors.push("Nincs exportálható kép.");
  if (!payload.listing.price) warnings.push("Hiányzó ár.");
  if (!payload.media.floorplans.length) warnings.push("Nincs alaprajz.");
  if (!payload.media.tours.length) warnings.push("Nincs tour/3D link.");
  return { ok: errors.length === 0, errors, warnings };
}

export async function createPortalExport(input: { agencyId: string; listing: ListingExportInput; targetPortal: string; format?: string; generatedById?: string }) {
  const payload = buildPortalPayload(input.listing, input.targetPortal);
  const validation = validatePortalPayload(payload);
  const status = validation.ok ? "GENERATED" : "FAILED";
  return prisma.portalExport.create({
    data: {
      agencyId: input.agencyId,
      listingId: input.listing.id,
      targetPortal: input.targetPortal,
      format: input.format ?? "json",
      status,
      payloadJson: payload as object,
      validationJson: validation as object,
      generatedById: input.generatedById,
      generatedAt: new Date(),
      error: validation.ok ? null : validation.errors.join(" ")
    }
  });
}
