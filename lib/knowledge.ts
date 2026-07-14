import type { Listing, ListingMedia, Tour, Floorplan, AiOutput } from "@prisma/client";
import { formatPrice } from "@/lib/format";

type KnowledgeListing = Listing & {
  media?: ListingMedia[];
  tours?: Tour[];
  floorplans?: Floorplan[];
  aiOutputs?: AiOutput[];
};

export function buildPropertyKnowledgeBase(listing: KnowledgeListing) {
  const facts = [
    `Cím: ${listing.title}`,
    `Típus: ${listing.propertyType}`,
    `Város: ${listing.city}`,
    listing.district ? `Kerület/városrész: ${listing.district}` : null,
    listing.neighborhood ? `Környék: ${listing.neighborhood}` : null,
    listing.price ? `Ár: ${formatPrice(listing.price)}` : null,
    listing.sizeM2 ? `Méret: ${listing.sizeM2} m²` : null,
    listing.rooms ? `Szobák: ${listing.rooms}` : null,
    listing.bedrooms ? `Hálók: ${listing.bedrooms}` : null,
    listing.bathrooms ? `Fürdők: ${listing.bathrooms}` : null,
    listing.floor ? `Emelet: ${listing.floor}` : null,
    listing.condition ? `Állapot: ${listing.condition}` : null,
    listing.balcony ? `Erkély/terasz: ${listing.balcony}` : null,
    listing.parking ? `Parkolás: ${listing.parking}` : null,
    listing.heating ? `Fűtés: ${listing.heating}` : null,
    listing.orientation ? `Tájolás: ${listing.orientation}` : null,
    listing.energyRating ? `Energetika: ${listing.energyRating}` : null,
    listing.descriptionRaw ? `Belső leírás: ${listing.descriptionRaw}` : null,
    listing.descriptionAi ? `AI leírás: ${listing.descriptionAi}` : null
  ].filter(Boolean) as string[];

  const mediaFacts = (listing.media ?? []).map((m, index) => [
    `Média ${index + 1}: ${m.mediaType}`,
    m.roomLabel ? `szoba: ${m.roomLabel}` : null,
    m.qualityScore ? `minőség: ${m.qualityScore}/100` : null,
    m.isStaged ? "AI látványterv/staging jelölés szükséges" : null
  ].filter(Boolean).join(", "));

  const tourFacts = (listing.tours ?? []).map((t) => `Tour: ${t.tourType}${t.provider ? ` (${t.provider})` : ""}${t.embedUrl ? " beágyazva" : ""}`);
  const floorplanFacts = (listing.floorplans ?? []).map((f) => `Alaprajz: ${f.type}, státusz: ${f.status}`);

  return {
    facts,
    mediaFacts,
    tourFacts,
    floorplanFacts,
    disclosureRules: [
      "AI stagingelt képet mindig jelölni kell.",
      "Nem létező extrát nem szabad állítani.",
      "Ha nincs adat, a chatnek azt kell mondania, hogy nincs pontos adat a hirdetésben."
    ],
    plainText: [...facts, ...mediaFacts, ...tourFacts, ...floorplanFacts].join("\n")
  };
}

export function answerFromKnowledgeBase(question: string, listing: KnowledgeListing) {
  const kb = buildPropertyKnowledgeBase(listing);
  const q = question.toLowerCase();
  const directAnswers: Array<[RegExp, string | null]> = [
    [/erk[eé]ly|terasz/, listing.balcony ? `Igen, a hirdetés szerint: ${listing.balcony}.` : null],
    [/m[eé]ret|h[aá]ny m2|h[aá]ny négyzet/, listing.sizeM2 ? `A megadott méret ${listing.sizeM2} m².` : null],
    [/szoba|h[aá]ny szob/, listing.rooms ? `A hirdetésben ${listing.rooms} szoba szerepel.` : null],
    [/[aá]r|mennyibe|forint|ft/, listing.price ? `Az irányár: ${formatPrice(listing.price)}.` : null],
    [/f[uű]t[eé]s/, listing.heating ? `A fűtés: ${listing.heating}.` : null],
    [/parkol|gar[aá]zs/, listing.parking ? `Parkolás: ${listing.parking}.` : null],
    [/emelet/, listing.floor ? `Emelet: ${listing.floor}.` : null],
    [/k[oö]rny[eé]k|lok[aá]ci[oó]|hol van/, listing.neighborhood || listing.district || listing.city ? `Lokáció: ${[listing.city, listing.district, listing.neighborhood].filter(Boolean).join(", ")}.` : null]
  ];

  for (const [pattern, answer] of directAnswers) {
    if (pattern.test(q)) {
      return answer
        ? { answer, confidence: "high", citations: ["listing_facts"], should_create_lead: false }
        : { answer: "Erre nincs pontos adat a hirdetésben, de szívesen továbbítom a kérdést az ingatlanosnak.", confidence: "low", citations: [], should_create_lead: true };
    }
  }

  return {
    answer: "A hirdetés alapján ezt pontosan nem tudom megerősíteni. A kérdést továbbítani tudjuk az ingatlanosnak, hogy biztos választ kapj.",
    confidence: "low",
    citations: [],
    should_create_lead: true,
    knowledgePreview: kb.facts.slice(0, 5)
  };
}
