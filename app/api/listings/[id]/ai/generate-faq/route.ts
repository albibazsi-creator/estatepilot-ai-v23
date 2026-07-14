import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { audit } from "@/lib/audit";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const faq = {
    questions: [
      { q: "Mekkora az ingatlan?", a: listing.sizeM2 ? `${listing.sizeM2} m².` : "Nincs pontos méret megadva." },
      { q: "Hány szobás?", a: listing.rooms ? `${listing.rooms} szobás.` : "Nincs pontos szobaszám megadva." },
      { q: "Hol található?", a: `${listing.city}${listing.district ? `, ${listing.district}` : ""}.` },
      { q: "Lehet időpontot foglalni?", a: "Igen, a hirdetés oldalán lévő űrlapon keresztül." }
    ]
  };
  const output = await prisma.aiOutput.create({ data: { listingId: id, outputType: "faq", contentJson: faq } });
  await audit("faq_generated", "AiOutput", output.id, { listingId: id }, user.id);
  return NextResponse.json(output);
}
