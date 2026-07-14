import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded, parseJson } from "@/lib/api-response";
import { calculatePricePosition, makeComparablePayload } from "@/lib/valuation";

const schema = z.object({ listingId: z.string().optional(), title: z.string().min(2), city: z.string().min(2), district: z.string().optional(), price: z.number().int().positive(), sizeM2: z.number().positive(), rooms: z.number().optional(), url: z.string().url().optional() });

export async function GET(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const url = new URL(req.url);
    const listingId = url.searchParams.get("listingId") ?? undefined;
    const [listing, comparables] = await Promise.all([
      listingId ? prisma.listing.findFirst({ where: { id: listingId, agencyId: agency.id } }) : null,
      prisma.valuationComparable.findMany({ where: { agencyId: agency.id, ...(listingId ? { listingId } : {}) }, orderBy: { similarityScore: "desc" } })
    ]);
    return { comparables, valuation: listing ? calculatePricePosition(listing, comparables) : null };
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const { data, error } = await parseJson(req, schema);
    if (error) return error;
    return prisma.valuationComparable.create({ data: { agencyId: agency.id, ...makeComparablePayload(data) } });
  });
}
