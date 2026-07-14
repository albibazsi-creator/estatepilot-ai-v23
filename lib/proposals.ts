import { prisma } from "@/lib/prisma";

export async function generateProposalDraft(input: { agencyId: string; listingId?: string; leadId?: string; dealId?: string; generatedById?: string }) {
  const lead = input.leadId ? await prisma.lead.findUnique({ where: { id: input.leadId }, include: { listing: true } }) : null;
  const listing = input.listingId ? await prisma.listing.findUnique({ where: { id: input.listingId } }) : lead?.listing ?? null;
  const deal = input.dealId ? await prisma.dealPipelineItem.findUnique({ where: { id: input.dealId } }) : null;

  if (!listing && !lead) throw new Error("Listing vagy lead szükséges ajánlat draft generálásához.");

  const title = lead ? `${lead.name} follow-up ajánlat` : `${listing?.title ?? "Ingatlan"} érdeklődői ajánlat`;
  const subject = listing ? `Megtekintési lehetőség: ${listing.title}` : "Ingatlan megtekintési lehetőség";
  const callScript = [
    `Szia ${lead?.name ?? ""}! Azért kereslek, mert érdeklődtél a(z) ${listing?.title ?? "ingatlan"} iránt.`,
    "Két gyors kérdésem lenne: saját célra vagy befektetésként nézed, illetve mikor lenne ideális a költözés?",
    "Ha komoly a szándék, ajánlok két konkrét megtekintési időpontot, hogy ne csússzon el más érdeklődő miatt."
  ].join("\n");

  const bodyMarkdown = `Szia ${lead?.name ?? ""}!\n\nKöszönöm az érdeklődésed a **${listing?.title ?? "meghirdetett ingatlan"}** iránt.\n\nA megadott adatok alapján ez az ingatlan releváns lehet számodra, főleg ha fontos a gyors, átlátható online bemutatás, az alapadatok és a személyes megtekintés lehetősége.\n\n**Következő lépés:** javaslok egy rövid telefonos egyeztetést, utána pedig tudunk konkrét megtekintési időpontot fixálni.\n\nÜdv,\nEstatePilot AI demo agent`;

  return prisma.proposalDraft.create({
    data: {
      agencyId: input.agencyId,
      listingId: listing?.id,
      leadId: lead?.id,
      dealId: deal?.id,
      title,
      offerType: deal?.stage === "offer_prepared" ? "purchase_offer" : "viewing_followup",
      subject,
      bodyMarkdown,
      callScript,
      nextActionsJson: {
        actions: [
          "Call within 2 hours if lead score is above 80.",
          "Offer two specific viewing slots.",
          "Send seller-report friendly update after viewing."
        ]
      },
      generatedById: input.generatedById
    }
  });
}
