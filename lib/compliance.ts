import type { Listing, ListingMedia, Tour, Floorplan } from "@prisma/client";

type ListingForCompliance = Listing & {
  media?: ListingMedia[];
  tours?: Tour[];
  floorplans?: Floorplan[];
};

export type ComplianceItem = {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  details: string;
};

export function buildPublishChecklist(listing: ListingForCompliance) {
  const media = listing.media ?? [];
  const tours = listing.tours ?? [];
  const floorplans = listing.floorplans ?? [];
  const items: ComplianceItem[] = [];

  items.push({
    id: "core_facts",
    label: "Alapadatok kitöltve",
    status: listing.title && listing.city && listing.propertyType && listing.sizeM2 && listing.rooms ? "pass" : "fail",
    details: "Cím, város, típus, méret és szobaszám nélkül nem érdemes publikálni."
  });

  items.push({
    id: "pricing",
    label: "Ár / irányár megadva",
    status: listing.price ? "pass" : "warning",
    details: listing.price ? "Az ár szerepel a listingben." : "Ár nélkül gyengébb lesz a lead minőség és a riport."
  });

  items.push({
    id: "gallery",
    label: "Galéria minőség",
    status: media.length >= 8 ? "pass" : media.length >= 4 ? "warning" : "fail",
    details: `${media.length} médiaelem található. Prémium landinghez legalább 8 képet javaslunk.`
  });

  items.push({
    id: "cover",
    label: "Borítókép kiválasztva",
    status: media.some((m) => m.isCover) ? "pass" : "warning",
    details: "A borítókép erősen befolyásolja a kattintási arányt."
  });

  items.push({
    id: "tour",
    label: "360 / Matterport / Tour",
    status: tours.length > 0 ? "pass" : "warning",
    details: tours.length > 0 ? "Van beágyazott vagy saját tour." : "A prémium csomaghoz legalább Matterport/iframe/360 tour ajánlott."
  });

  items.push({
    id: "floorplan",
    label: "Alaprajz",
    status: floorplans.length > 0 || media.some((m) => m.mediaType === "FLOORPLAN") ? "pass" : "warning",
    details: "Az alaprajz növeli a komoly érdeklődők arányát és a seller report értékét."
  });

  const staged = media.filter((m) => m.isStaged || m.disclosureRequired);
  items.push({
    id: "ai_disclosure",
    label: "AI staging jelölés",
    status: staged.every((m) => m.disclosureRequired) ? "pass" : staged.length ? "fail" : "pass",
    details: staged.length ? `${staged.length} AI/stagingelt kép van. Mindet jelölni kell.` : "Nincs stagingelt kép, vagy nincs disclosure kötelezettség."
  });

  items.push({
    id: "lead_gdpr",
    label: "Lead GDPR hozzájárulás",
    status: "pass",
    details: "A publikus lead form GDPR checkboxot használ, az időpont és lead események naplózhatók."
  });

  const fails = items.filter((item) => item.status === "fail").length;
  const warnings = items.filter((item) => item.status === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - fails * 25 - warnings * 8));

  return {
    score,
    canPublish: fails === 0,
    items,
    summary: fails === 0 ? "Publikálható, de a warningokat érdemes javítani." : "Publikálás előtt kötelező hibák vannak."
  };
}

export function buildComplianceAudit(listing: ListingForCompliance) {
  const checklist = buildPublishChecklist(listing);
  return {
    checklist,
    policy: [
      "AI stagingelt képet mindig jelölni kell.",
      "Szerkezeti hibát, penészt, kilátást vagy nem létező extrát nem szabad megtévesztően elrejteni/állítani.",
      "AI chat csak a listing knowledge base alapján válaszolhat.",
      "Tulajdonosi riportban csak mért aktivitás és világosan jelölt AI javaslat szerepelhet.",
      "Lead gyűjtéshez GDPR hozzájárulás szükséges."
    ],
    requiredNextActions: checklist.items.filter((item) => item.status !== "pass").map((item) => item.details)
  };
}
