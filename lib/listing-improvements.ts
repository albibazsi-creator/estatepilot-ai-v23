import { prisma } from "@/lib/prisma";

export async function generateListingImprovements(agencyId: string, listingId: string) {
  const listing = await prisma.listing.findFirst({ where: { id: listingId, agencyId }, include: { media: true, tours: true, floorplans: true, leads: true } });
  if (!listing) throw new Error("Listing not found");
  const items: Array<{ category: string; title: string; rationale: string; suggestedAction: string; priority: number; expectedImpact?: string }> = [];

  if (!listing.media.some((m) => m.isCover)) items.push({ category: "gallery", title: "Hiányzik a kijelölt borítókép", rationale: "A public listing első benyomása gyengébb borítókép nélkül.", suggestedAction: "Jelöld ki a legerősebb nappali/külső képet cover image-nek.", priority: 90, expectedImpact: "+10–20% gallery open" });
  if (listing.media.length < 6) items.push({ category: "media", title: "Kevés kép a prémium listinghez", rationale: "A komoly érdeklődők több szobaképet várnak.", suggestedAction: "Tölts fel legalább 8–12 képet, szobánként minimum 2 nézettel.", priority: 80 });
  if (!listing.tours.length) items.push({ category: "tour", title: "Nincs 360/3D tour", rationale: "A rendszer fő értékajánlata a bejárható digitális bemutató.", suggestedAction: "Adj hozzá Matterport/iframe linket vagy 360 panoráma képet.", priority: 85 });
  if (!listing.floorplans.length) items.push({ category: "floorplan", title: "Hiányzik az alaprajz", rationale: "Az alaprajzot megnyitó látogató erősebb vásárlási szándékot jelez.", suggestedAction: "Tölts fel alaprajz PDF-et vagy képet, majd kösd a szobákhoz.", priority: 65 });
  if (!listing.descriptionAi) items.push({ category: "copy", title: "Nincs AI hirdetésszöveg", rationale: "A platform-specifikus leírás segíti a lead konverziót.", suggestedAction: "Futtasd az AI listing generator endpointot.", priority: 60 });
  if (listing.leads.length === 0 && listing.isPublished) items.push({ category: "conversion", title: "Publikus listing, de még nincs lead", rationale: "A látogatói útvonal valószínűleg nem elég erős vagy nincs forgalom.", suggestedAction: "Generálj kampánycsomagot, tesztelj új CTA-t és Reels hookot.", priority: 75 });

  if (!items.length) items.push({ category: "optimization", title: "A listing jó állapotú", rationale: "Az alap konverziós elemek megvannak.", suggestedAction: "Futtass A/B headline tesztet és küldj heti seller reportot.", priority: 40 });

  await prisma.listingImprovementRecommendation.updateMany({ where: { agencyId, listingId, status: "open" }, data: { status: "superseded", resolvedAt: new Date() } });
  return prisma.listingImprovementRecommendation.createMany({ data: items.map((item) => ({ agencyId, listingId, ...item })) });
}
