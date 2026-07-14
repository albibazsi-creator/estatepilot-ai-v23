import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const roleRank: Record<UserRole, number> = {
  BUYER: 0,
  SELLER: 1,
  AGENT: 2,
  AGENCY_OWNER: 3,
  ADMIN: 4
};

export async function requireRole(minRole: UserRole) {
  const ctx = await getCurrentUser();
  const membershipRole = ctx.user.agencyMembers[0]?.role ?? ctx.user.role;
  if (roleRank[membershipRole] < roleRank[minRole]) {
    throw new Error(`Forbidden: ${minRole} role required`);
  }
  return ctx;
}

export async function requireListingAccess(listingId: string) {
  const ctx = await getCurrentUser();
  const listing = await prisma.listing.findFirst({ where: { id: listingId, agencyId: ctx.agency.id } });
  if (!listing) throw new Error("Listing not found or inaccessible");
  return { ...ctx, listing };
}
