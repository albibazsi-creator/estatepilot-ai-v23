export function calculatePricePosition(listing: { price?: number | null; sizeM2?: number | null }, comparables: { pricePerM2: number; similarityScore?: number | null }[]) {
  if (!listing.price || !listing.sizeM2 || comparables.length === 0) {
    return { listingPricePerM2: null, medianComparablePricePerM2: null, position: "unknown", recommendation: "Nincs elég adat megbízható összehasonlításhoz." };
  }
  const listingPricePerM2 = Math.round(listing.price / listing.sizeM2);
  const weighted = comparables
    .map((c) => ({ value: c.pricePerM2, weight: Math.max(10, c.similarityScore ?? 50) }))
    .sort((a, b) => a.value - b.value);
  const totalWeight = weighted.reduce((s, item) => s + item.weight, 0);
  let acc = 0;
  let medianComparablePricePerM2 = weighted[Math.floor(weighted.length / 2)]?.value ?? null;
  for (const item of weighted) {
    acc += item.weight;
    if (acc >= totalWeight / 2) {
      medianComparablePricePerM2 = item.value;
      break;
    }
  }
  const diffPct = medianComparablePricePerM2 ? Math.round(((listingPricePerM2 - medianComparablePricePerM2) / medianComparablePricePerM2) * 100) : 0;
  const position = diffPct > 8 ? "above_market" : diffPct < -8 ? "below_market" : "market_aligned";
  const recommendation = position === "above_market"
    ? "Az ár a hasonló minták felett van. Erős prémium prezentáció vagy árteszt szükséges."
    : position === "below_market"
      ? "Az ár a hasonló minták alatt van. Jó leadgenerálási kampány és gyors megtekintések ajánlottak."
      : "Az ár nagyjából piaci sávban van. A konverziót a vizuális élmény és lead follow-up döntheti el.";
  return { listingPricePerM2, medianComparablePricePerM2, diffPct, position, recommendation };
}

export function makeComparablePayload(input: { price: number; sizeM2: number; title: string; city: string; district?: string; rooms?: number; url?: string }) {
  return {
    ...input,
    pricePerM2: Math.round(input.price / input.sizeM2),
    similarityScore: 60,
    source: input.url ? "manual_url" : "manual"
  };
}
