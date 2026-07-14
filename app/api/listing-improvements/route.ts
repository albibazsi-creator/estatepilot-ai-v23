import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ok, parseJson, guarded } from "@/lib/api-response";
import { generateListingImprovements } from "@/lib/listing-improvements";

const schema = z.object({ listingId: z.string() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const recommendations = await prisma.listingImprovementRecommendation.findMany({ where: { agencyId: agency.id }, orderBy: [{ priority: "desc" }, { createdAt: "desc" }], take: 80 });
    return { recommendations };
  });
}

export async function POST(req: Request) {
  const { agency } = await getCurrentUser();
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const result = await generateListingImprovements(agency.id, parsed.data.listingId);
  return ok({ result }, { status: 201 });
}
