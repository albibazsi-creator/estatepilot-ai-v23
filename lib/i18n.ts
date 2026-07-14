export const SUPPORTED_LOCALES = ["hu", "en", "de"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function listingDisclosure(locale: string) {
  if (locale === "en") return "AI-assisted listing content. Virtually staged images are marked where applicable.";
  if (locale === "de") return "KI-unterstützter Exposé-Text. Virtuell möblierte Bilder sind entsprechend gekennzeichnet.";
  return "AI által támogatott hirdetésszöveg. A virtuálisan berendezett képeket külön jelöljük.";
}

export function translateListingMock(listing: { title: string; city: string; district?: string | null; descriptionAi?: string | null; descriptionRaw?: string | null }, locale: string) {
  const base = listing.descriptionAi || listing.descriptionRaw || "Prémium digitális ingatlanbemutató AI támogatással.";
  if (locale === "en") {
    return {
      title: `${listing.title} • premium digital property showcase`,
      shortHook: `Explore this ${listing.city} property online before booking a viewing.`,
      description: `This AI-assisted premium listing presents the property with gallery, tour, lead form and owner-ready reporting. Location: ${listing.city}${listing.district ? `, ${listing.district}` : ""}.\n\nOriginal local description summary: ${base}`,
      highlights: ["Digital showcase", "Lead-ready landing page", "Tour and gallery first experience"]
    };
  }
  if (locale === "de") {
    return {
      title: `${listing.title} • digitales Premium-Exposé`,
      shortHook: `Besichtigen Sie diese Immobilie in ${listing.city} online vor dem Termin.`,
      description: `Dieses KI-gestützte Premium-Exposé kombiniert Galerie, Tour, Anfrageformular und Eigentümer-Reporting. Lage: ${listing.city}${listing.district ? `, ${listing.district}` : ""}.\n\nLokale Beschreibung: ${base}`,
      highlights: ["Digitales Exposé", "Lead-orientierte Landingpage", "Tour und Galerie"]
    };
  }
  return {
    title: listing.title,
    shortHook: `${listing.city} ingatlan prémium digitális bemutatóval.`,
    description: base,
    highlights: ["Prémium landing oldal", "Galéria és tour", "Leadgyűjtés és riport"]
  };
}
