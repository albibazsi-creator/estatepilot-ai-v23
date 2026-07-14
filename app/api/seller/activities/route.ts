import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { guarded, parseJson } from "@/lib/api-response";
import { createSellerActivity } from "@/lib/seller-activity";

const schema = z.object({ listingId: z.string(), activityType: z.string(), title: z.string(), description: z.string().optional(), impactScore: z.number().int().min(0).max(100).optional() });

export async function GET(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const url = new URL(req.url);
    const listingId = url.searchParams.get("listingId") ?? undefined;
    return prisma.sellerPortalActivity.findMany({ where: { agencyId: agency.id, ...(listingId ? { listingId } : {}) }, orderBy: { createdAt: "desc" }, take: 50 });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const { data, error } = await parseJson(req, schema);
    if (error) return error;
    const listing = await prisma.listing.findFirst({ where: { id: data.listingId, agencyId: agency.id } });
    if (!listing) throw new Error("Listing not found");
    return createSellerActivity({ agencyId: agency.id, sellerEmail: listing.ownerReportEmail ?? listing.sellerEmail, ...data });
  });
}
