export type ListingReadinessInput = {
  title?: string | null;
  price?: number | null;
  sizeM2?: number | null;
  rooms?: number | null;
  city?: string | null;
  descriptionRaw?: string | null;
  descriptionAi?: string | null;
  media?: { mediaType: string; isCover?: boolean | null; qualityScore?: number | null }[];
  tours?: { tourType: string; status?: string | null }[];
  floorplans?: unknown[];
};

export function calculateListingReadiness(listing: ListingReadinessInput) {
  let score = 0;
  const missing: string[] = [];
  const wins: string[] = [];

  function add(condition: boolean, points: number, win: string, miss: string) {
    if (condition) {
      score += points;
      wins.push(win);
    } else missing.push(miss);
  }

  const media = listing.media ?? [];
  const images = media.filter((m) => m.mediaType === "IMAGE" || m.mediaType === "PANORAMA_360");
  const hasGoodCover = media.some((m) => m.isCover && (m.qualityScore ?? 70) >= 65);
  const hasTour = (listing.tours ?? []).some((t) => ["ready", "READY"].includes(t.status ?? "ready"));
  const hasFloorplan = (listing.floorplans ?? []).length > 0 || media.some((m) => m.mediaType === "FLOORPLAN");

  add(Boolean(listing.title && listing.city), 10, "alapadatok megvannak", "cím és város");
  add(Boolean(listing.price && listing.sizeM2 && listing.rooms), 15, "ár/méret/szobaszám megvan", "ár, méret és szobaszám");
  add(images.length >= 6, 18, "legalább 6 kép van", "minimum 6 jó kép");
  add(hasGoodCover, 12, "van borítókép", "borítókép kijelölése");
  add(Boolean(listing.descriptionAi || listing.descriptionRaw), 12, "van hirdetésszöveg", "AI vagy nyers hirdetésszöveg");
  add(hasTour, 15, "van 360/3D túra vagy embed", "Matterport/360/tour hozzáadása");
  add(hasFloorplan, 10, "van alaprajz", "alaprajz feltöltése");
  add(media.some((m) => typeof m.qualityScore === "number"), 8, "AI képelemzés lefutott", "AI képelemzés futtatása");

  score = Math.min(100, score);
  const status = score >= 85 ? "sales-ready" : score >= 65 ? "demo-ready" : score >= 40 ? "needs-work" : "weak";

  return { score, status, missing, wins };
}
