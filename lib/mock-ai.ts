import type { Listing, ListingMedia } from "@prisma/client";
import { formatPrice } from "@/lib/format";

export function mockImageAnalysis(media: ListingMedia[]) {
  return {
    rooms: media.map((image, index) => ({
      image_id: image.id,
      room_type: image.roomLabel ?? inferRoom(index),
      quality_score: Math.max(68, 92 - index * 4),
      issues: index % 3 === 0 ? ["slightly_dark"] : [],
      features: index % 2 === 0 ? ["large_window", "bright_room"] : ["clean_layout"],
      is_cover_candidate: index === 0,
      staging_candidate: false
    })),
    property_strengths: ["világos terek", "jó elrendezés", "online jól bemutatható ingatlan"],
    marketing_angles: ["family", "investment", "first_home"],
    warnings: ["Ne állíts pontos felújítási évet, ha nincs megadva."]
  };
}

function inferRoom(index: number) {
  return ["living_room", "kitchen", "bedroom", "bathroom", "balcony", "hall"][index % 6];
}

export function mockListingCopy(listing: Listing) {
  const title = `${listing.city}${listing.district ? ` ${listing.district}` : ""} – ${listing.sizeM2 ?? ""} m²-es ${listing.propertyType}`;
  return {
    title,
    short_hook: "Prémium digitális bemutatóval, AI által összeállított hirdetési anyaggal és mérhető érdeklődőkezeléssel.",
    long_description: `${listing.title}\n\nEz az ingatlan egy letisztult, online is erősen bemutatható ajánlat. A hirdetés célja, hogy ne csak képeket mutasson, hanem valódi bejárható élményt adjon: galériával, 360/3D túrával, alaprajzzal és gyors érdeklődési lehetőséggel.\n\nFő adatok: ${listing.sizeM2 ?? "–"} m², ${listing.rooms ?? "–"} szoba, lokáció: ${listing.city}${listing.district ? `, ${listing.district}` : ""}, ár: ${formatPrice(listing.price)}.\n\nA részletek személyes megtekintésen pontosíthatók.`,
    bullet_points: [
      "Automatikusan generált prémium landing oldal",
      "Képgaléria és 360/3D túra támogatás",
      "Lead űrlap és érdeklődői pontozás",
      "Tulajdonosbarát riportálás"
    ],
    cta: "Kérj megtekintési időpontot, vagy küldd el a kérdésed az ingatlanról.",
    compliance_warnings: ["AI staging vagy látványterv esetén kötelező a jelölés."]
  };
}

export function mockSocialCopy(listing: Listing) {
  return {
    facebook: `🏡 Új ajánlat: ${listing.title}\n\n${listing.sizeM2 ?? ""} m² • ${listing.rooms ?? ""} szoba • ${listing.city}\n\nNézd meg a galériát, a 3D/360 túrát és kérj időpontot pár kattintással.`,
    instagram: `Prémium ingatlanbemutató, nem csak sima hirdetés. ✨\n\n${listing.title}\n${listing.city}${listing.district ? `, ${listing.district}` : ""}\n\nGaléria • 360 túra • gyors érdeklődés`,
    investor: `Befektetői nézőpontból: ${listing.title}. Lokáció, online bejárhatóság, gyors lead capture és mérhető érdeklődés.`
  };
}

export function mockReelsScript(listing: Listing) {
  return {
    hook: "Ezt az ingatlant már nem csak képeken kell elképzelned.",
    script_15s: [
      "Nyitó: prémium cover kép és ár/méret overlay.",
      "Gyors vágás: nappali, konyha, háló, fürdő.",
      "Középrész: 360/3D bejárás képernyőn.",
      "Zárás: Időpontfoglalás és lead űrlap CTA."
    ],
    voiceover: `Ez itt ${listing.title}. Nézd meg online, járd be 3D-ben, és kérj időpontot azonnal.`
  };
}
