export const partnerApiContractV2 = {
  version: "2026-07-v2",
  authentication: "Bearer ep_live_xxx or ep_test_xxx API key",
  endpoints: [
    { method: "GET", path: "/api/partner/v2/listings", scope: "listings:read", description: "Agency scoped listing feed with readiness and portal export status." },
    { method: "GET", path: "/api/partner/v2/listings/:id/data-room", scope: "listings:read", description: "Safe listing data-room package for portals/partners." },
    { method: "POST", path: "/api/partner/v2/leads", scope: "leads:write", description: "Create lead from external partner source." }
  ],
  guarantees: ["No cross-agency data", "GDPR consent fields required for lead create", "Request is logged without raw PII payload"]
};

export function partnerListingPayload(listing: any) {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    status: listing.status,
    city: listing.city,
    district: listing.district,
    price: listing.price,
    sizeM2: listing.sizeM2,
    rooms: listing.rooms,
    readinessScore: listing.aiReadinessScore,
    published: listing.isPublished,
    mediaCount: listing.media?.length ?? 0,
    leadCount: listing.leads?.length ?? 0,
    updatedAt: listing.updatedAt
  };
}
