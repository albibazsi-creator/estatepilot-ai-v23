import type { Lead, Listing } from "@prisma/client";
import { formatPrice } from "@/lib/format";

export function buildLeadOfferDraft(lead: Lead, listing: Listing) {
  const contact = lead.phone || lead.email || "nincs megadva";
  const urgency = lead.leadScore >= 81 ? "forró" : lead.leadScore >= 61 ? "meleg" : "normál";
  return {
    title: `Ajánlat / follow-up draft – ${lead.name}`,
    leadTemperature: urgency,
    recommendedAction: lead.leadScore >= 81 ? "Telefonos visszahívás 2 órán belül" : "Személyes megtekintési időpont ajánlása 24 órán belül",
    callScript: [
      `Szia ${lead.name}, ${listing.title} miatt kereslek.`,
      `Láttam, hogy érdeklődtél az ingatlan iránt. A fő adatok: ${listing.sizeM2 ?? "–"} m², ${listing.rooms ?? "–"} szoba, irányár: ${formatPrice(listing.price)}.`,
      "Szeretnéd megnézni személyesen? Tudok ajánlani több megtekintési időpontot is."
    ],
    emailDraft: {
      subject: `Megtekintési időpont – ${listing.title}`,
      body: `Szia ${lead.name}!\n\nKöszönöm az érdeklődésed a(z) ${listing.title} iránt.\n\nAz ingatlan fő adatai:\n- Lokáció: ${listing.city}${listing.district ? `, ${listing.district}` : ""}\n- Méret: ${listing.sizeM2 ?? "–"} m²\n- Szobák: ${listing.rooms ?? "–"}\n- Ár: ${formatPrice(listing.price)}\n\nSzívesen mutatok hozzá személyes megtekintési időpontot. Mikor lenne neked alkalmas?\n\nÜdv,\nEstatePilot AI demo agent`
    },
    leadContext: {
      contact,
      financingType: lead.financingType,
      buyingIntent: lead.buyingIntent,
      moveTimeline: lead.moveTimeline,
      message: lead.message
    }
  };
}
