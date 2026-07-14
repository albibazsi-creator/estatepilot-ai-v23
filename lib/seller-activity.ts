import { prisma } from "@/lib/prisma";

export async function createSellerActivity(input: { agencyId: string; listingId: string; sellerEmail?: string | null; activityType: string; title: string; description?: string; impactScore?: number; metadataJson?: unknown }) {
  return prisma.sellerPortalActivity.create({
    data: {
      agencyId: input.agencyId,
      listingId: input.listingId,
      sellerEmail: input.sellerEmail ?? undefined,
      activityType: input.activityType,
      title: input.title,
      description: input.description,
      impactScore: input.impactScore ?? 0,
      metadataJson: input.metadataJson as object | undefined
    }
  });
}

export function sellerActivityTemplates() {
  return [
    { activityType: "marketing", title: "Új kampányszöveg készült", impactScore: 35 },
    { activityType: "lead", title: "Új komoly érdeklődő érkezett", impactScore: 80 },
    { activityType: "tour", title: "Többen megnyitották a 360/3D túrát", impactScore: 45 },
    { activityType: "recommendation", title: "AI javaslat: borítókép vagy árkommunikáció teszt", impactScore: 55 }
  ];
}
