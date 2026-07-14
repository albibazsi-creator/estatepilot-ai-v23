import type { Listing, ListingMedia, AiOutput } from "@prisma/client";
import { formatPrice } from "@/lib/format";

type CampaignListing = Listing & { media?: ListingMedia[]; aiOutputs?: AiOutput[] };

export function generateCampaignPlan(listing: CampaignListing) {
  const base = `${listing.title} • ${listing.city}${listing.district ? `, ${listing.district}` : ""}`;
  const priceLine = listing.price ? formatPrice(listing.price) : "ár egyeztetés szerint";
  const roomLine = [listing.sizeM2 ? `${listing.sizeM2} m²` : null, listing.rooms ? `${listing.rooms} szoba` : null].filter(Boolean).join(" • ");

  return {
    campaign_name: `${listing.city} listing conversion kampány`,
    objective: "lead_generation",
    positioning: "Nem sima hirdetés: prémium digitális bemutató, galéria, 360/3D bejárás és gyors időpontkérés.",
    audiences: [
      { name: "Saját célra keresők", angle: "élhetőség, lokáció, praktikus elosztás", platforms: ["Facebook", "Instagram"] },
      { name: "Befektetők", angle: "kiadhatóság, lokáció, gyors döntést segítő landing", platforms: ["Facebook"] },
      { name: "Prémium nézelődők", angle: "bejárható online élmény és minőségi prezentáció", platforms: ["Instagram", "Reels"] }
    ],
    assets: {
      meta_primary_texts: [
        `🏡 ${base}\n${roomLine}\n${priceLine}\n\nNézd meg online, járd be a galériát/360 túrát, és kérj időpontot pár kattintással.`,
        `Ez az ingatlan nem csak képeken látható: digitális bemutatóval, érdeklődési űrlappal és gyors megtekintési lehetőséggel vár.`
      ],
      headlines: [
        `${listing.city}: prémium ingatlanbemutató`,
        `Járd be online: ${listing.sizeM2 ?? ""} m² ${listing.propertyType}`.trim(),
        "Kérj megtekintési időpontot online"
      ],
      reels_hooks: [
        "Ezt a lakást már nem csak képeken kell elképzelned.",
        "Mutatok egy ingatlant, amit online is végig tudsz nézni.",
        "Ha lakást keresel, ezt a digitális bemutatót nézd meg."
      ],
      email_subjects: [
        `Új ingatlan: ${listing.city}${listing.district ? `, ${listing.district}` : ""}`,
        "Online bejárható ingatlanbemutató készült",
        "Megtekintési időpont pár kattintással"
      ],
      disclaimers: ["AI látványterv esetén minden képet jelölni kell.", "A hirdetésben csak megadott tények szerepelhetnek."]
    },
    budget_suggestion: {
      starter_huf_per_day: 3000,
      pro_huf_per_day: 8000,
      test_period_days: 7,
      kpis: ["landing page view", "lead submit", "tour open", "booking request"]
    },
    next_steps: [
      "Borítókép kiválasztása és ellenőrzése mobilon",
      "Meta kampány indítása lead objective-vel",
      "Reels hook teszt 2 kreatívval",
      "Forró leadek 2 órán belüli visszahívása"
    ]
  };
}
