type ListingFacts = { price?: number | null; city: string; district?: string | null; rooms?: number | null; sizeM2?: number | null; propertyType?: string | null };
type Persona = { budgetMin?: number | null; budgetMax?: number | null; preferredCities?: string[]; preferredDistricts?: string[]; intent?: string; mustHaveJson?: any };

export function scoreBuyerFit(listing: ListingFacts, persona: Persona) {
  let score = 40;
  const reasons: string[] = [];
  const risks: string[] = [];

  if (persona.preferredCities?.includes(listing.city)) { score += 18; reasons.push("Város preferenciával egyezik."); }
  if (listing.district && persona.preferredDistricts?.includes(listing.district)) { score += 16; reasons.push("Kerület preferenciával egyezik."); }
  if (listing.price && persona.budgetMax && listing.price <= persona.budgetMax) { score += 14; reasons.push("Ár belefér a megadott maximumba."); }
  if (listing.price && persona.budgetMin && listing.price < persona.budgetMin * 0.75) { risks.push("Ár jelentősen a megadott minimum alatt van, lehet eltérő minőségi elvárás."); score -= 5; }
  if (listing.price && persona.budgetMax && listing.price > persona.budgetMax) { risks.push("Ár meghaladja a buyer budgetet."); score -= 18; }
  if ((listing.rooms || 0) >= 2 && persona.intent === "family") { score += 8; reasons.push("Szobaszám családos érdeklődőnek kedvezőbb."); }
  if (persona.intent === "investment") { score += 6; reasons.push("Befektetői persona: digitális lead adatokkal jól validálható."); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const fitLabel = score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "medium" : "weak";
  return { score, fitLabel, reasons, risks, nextAction: score >= 70 ? "Küldj személyre szabott megtekintési ajánlatot." : "Kérj pontosabb igénylistát a buyer personához." };
}
