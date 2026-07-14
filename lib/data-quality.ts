import type { Floorplan, Listing, ListingMedia, Tour } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type QualityIssueInput = {
  severity: "critical" | "warning" | "info";
  code: string;
  title: string;
  description: string;
  suggestedFix?: string;
  entityType?: string;
  entityId?: string | null;
  metadataJson?: Record<string, unknown>;
};

type ListingWithAssets = Listing & { media?: ListingMedia[]; tours?: Tour[]; floorplans?: Floorplan[] };

export function assessListingDataQuality(listing: ListingWithAssets) {
  const issues: QualityIssueInput[] = [];
  const media = listing.media ?? [];
  const images = media.filter((m) => m.mediaType === "IMAGE");
  const lowQualityImages = images.filter((m) => (m.qualityScore ?? 80) < 55);
  const duplicateRoomLabels = new Set<string>();
  const seenRooms = new Set<string>();

  for (const image of images) {
    if (!image.roomLabel) {
      issues.push({ severity: "warning", code: "media_missing_room", title: "Kép szobacímke nélkül", description: "A szobacímkék nélkül gyengébb lesz a galéria és az AI property chat.", suggestedFix: "Adj meg szobanevet: nappali, konyha, háló, fürdő, terasz stb.", entityType: "ListingMedia", entityId: image.id });
    } else if (seenRooms.has(image.roomLabel)) duplicateRoomLabels.add(image.roomLabel);
    else seenRooms.add(image.roomLabel);
  }

  if (!listing.price) issues.push({ severity: "warning", code: "listing_missing_price", title: "Hiányzó ár", description: "Ár nélkül rosszabb a lead minőség és a tulajdonosi riport értelmezhetősége.", suggestedFix: "Adj meg irányárat vagy jelöld, hogy ár egyeztetés alapján." });
  if (!listing.sizeM2 || !listing.rooms) issues.push({ severity: "critical", code: "listing_missing_core_specs", title: "Hiányos méret/szobaszám", description: "Méret és szobaszám nélkül nem érdemes publikálni.", suggestedFix: "Töltsd ki a m² és szobaszám mezőket." });
  if (images.length < 6) issues.push({ severity: images.length < 3 ? "critical" : "warning", code: "gallery_too_small", title: "Kevés fotó", description: `${images.length} fotó van. Prémium bemutatóhoz legalább 8-12 fotó javasolt.`, suggestedFix: "Tölts fel minden fő helyiségről több képet." });
  if (!media.some((m) => m.isCover)) issues.push({ severity: "warning", code: "missing_cover", title: "Nincs borítókép", description: "A borítókép erősen befolyásolja a kattintási arányt.", suggestedFix: "Jelöld ki a legerősebb világos képet borítónak." });
  if (lowQualityImages.length) issues.push({ severity: "warning", code: "low_quality_images", title: "Gyenge minőségű képek", description: `${lowQualityImages.length} kép minőségi pontszáma alacsony.`, suggestedFix: "Cseréld világosabb, egyenesebb fotókra, vagy futtasd újra a képelemzést.", metadataJson: { mediaIds: lowQualityImages.map((m) => m.id) } });
  if (duplicateRoomLabels.size > 4) issues.push({ severity: "info", code: "room_label_repetition", title: "Sok ismétlődő szobacímke", description: "Lehet, hogy több kép ugyanabba a helyiségbe lett sorolva.", suggestedFix: "Ellenőrizd a galéria sorrendjét és címkéit." });
  if (!(listing.tours ?? []).length) issues.push({ severity: "warning", code: "missing_tour", title: "Hiányzó 360/3D túra", description: "A tour növeli a komoly érdeklődők arányát.", suggestedFix: "Adj meg Matterport/iframe linket vagy tölts fel panoráma képet." });
  if (!(listing.floorplans ?? []).length && !media.some((m) => m.mediaType === "FLOORPLAN")) issues.push({ severity: "info", code: "missing_floorplan", title: "Nincs alaprajz", description: "Az alaprajz segíti a döntést és csökkenti a felesleges kérdéseket.", suggestedFix: "Tölts fel alaprajzot PDF/kép formátumban." });

  const critical = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, Math.round(100 - critical * 25 - warnings * 8 - issues.filter((i) => i.severity === "info").length * 3));
  return { score, status: score >= 85 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "needs-polish" : "blocked", issues };
}

export async function persistDataQualityIssues(input: { agencyId: string; listing: ListingWithAssets }) {
  const report = assessListingDataQuality(input.listing);
  await prisma.dataQualityIssue.updateMany({ where: { agencyId: input.agencyId, listingId: input.listing.id, status: "open" }, data: { status: "superseded", resolvedAt: new Date() } });
  if (report.issues.length) {
    await prisma.dataQualityIssue.createMany({
      data: report.issues.map((issue) => ({
        agencyId: input.agencyId,
        listingId: input.listing.id,
        entityType: issue.entityType ?? "Listing",
        entityId: issue.entityId ?? input.listing.id,
        severity: issue.severity,
        code: issue.code,
        title: issue.title,
        description: issue.description,
        suggestedFix: issue.suggestedFix,
        metadataJson: issue.metadataJson
      }))
    });
  }
  return report;
}
