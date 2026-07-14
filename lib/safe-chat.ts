import { prisma } from "@/lib/prisma";

const knownFactKeywords = [
  { keys: ["erkély", "balcony"], field: "balcony", label: "erkély" },
  { keys: ["parkol", "garage", "garázs"], field: "parking", label: "parkolás" },
  { keys: ["fűtés", "heating"], field: "heating", label: "fűtés" },
  { keys: ["energia", "energetika"], field: "energyRating", label: "energetika" },
  { keys: ["költöz", "move"], field: "condition", label: "állapot / költözhetőség" }
];

export async function answerListingQuestion(listingId: string, question: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listing not found");
  const normalized = question.toLowerCase();
  const match = knownFactKeywords.find((item) => item.keys.some((key) => normalized.includes(key)));
  if (match) {
    const value = (listing as unknown as Record<string, unknown>)[match.field];
    if (value) {
      return { answer: `A hirdetés alapján: ${match.label}: ${String(value)}.`, confidence: "high", createdGap: false };
    }
  }
  const safeReply = "Erre nincs pontos adat a hirdetésben, ezért nem állítok biztosat. Szívesen továbbítom a kérdést az ingatlanosnak.";
  const gap = await prisma.chatKnowledgeGap.create({
    data: {
      agencyId: listing.agencyId,
      listingId,
      question,
      safeReply,
      severity: normalized.includes("ár") || normalized.includes("hitel") ? "high" : "medium",
      suggestedFact: match ? `Töltsd ki ezt a mezőt: ${match.label}` : "Bővítsd a property knowledge base-t ezzel az információval."
    }
  });
  return { answer: safeReply, confidence: "low", createdGap: true, gapId: gap.id };
}
