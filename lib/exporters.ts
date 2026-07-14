import type { Listing, ListingMedia, Lead, Tour, Floorplan, AiOutput, MarketingCampaign, SellerReport } from "@prisma/client";
import { buildPublishChecklist } from "@/lib/compliance";

export type FullListingExport = Listing & {
  media: ListingMedia[];
  tours: Tour[];
  floorplans: Floorplan[];
  leads: Lead[];
  aiOutputs: AiOutput[];
  marketingCampaigns?: MarketingCampaign[];
  sellerReports?: SellerReport[];
};

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function listingsToCsv(listings: Array<Listing & { leads?: Lead[]; media?: ListingMedia[] }>) {
  const rows = [
    ["id", "title", "city", "district", "price", "sizeM2", "rooms", "status", "isPublished", "leadCount", "mediaCount", "slug"],
    ...listings.map((listing) => [
      listing.id,
      listing.title,
      listing.city,
      listing.district ?? "",
      listing.price ?? "",
      listing.sizeM2 ?? "",
      listing.rooms ?? "",
      listing.status,
      listing.isPublished ? "yes" : "no",
      listing.leads?.length ?? 0,
      listing.media?.length ?? 0,
      listing.slug
    ])
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function buildListingExportPackage(listing: FullListingExport) {
  const checklist = buildPublishChecklist(listing);
  return {
    version: "v5-export-package",
    exportedAt: new Date().toISOString(),
    listing: {
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      status: listing.status,
      isPublished: listing.isPublished,
      facts: {
        propertyType: listing.propertyType,
        city: listing.city,
        district: listing.district,
        price: listing.price,
        currency: listing.currency,
        sizeM2: listing.sizeM2,
        rooms: listing.rooms,
        condition: listing.condition,
        balcony: listing.balcony,
        heating: listing.heating,
        parking: listing.parking,
        energyRating: listing.energyRating
      }
    },
    publishChecklist: checklist,
    media: listing.media.map((m) => ({ id: m.id, type: m.mediaType, url: m.url, room: m.roomLabel, isCover: m.isCover, isStaged: m.isStaged, disclosureRequired: m.disclosureRequired })),
    tours: listing.tours.map((t) => ({ id: t.id, type: t.tourType, provider: t.provider, status: t.status, embedUrl: t.embedUrl })),
    floorplans: listing.floorplans.map((f) => ({ id: f.id, type: f.type, status: f.status, fileUrl: f.fileUrl })),
    aiOutputs: listing.aiOutputs.map((o) => ({ type: o.outputType, modelUsed: o.modelUsed, createdAt: o.createdAt, content: o.contentJson })),
    campaigns: listing.marketingCampaigns?.map((c) => ({ name: c.name, objective: c.objective, status: c.status, assets: c.assetsJson })) ?? [],
    sellerReports: listing.sellerReports?.map((r) => ({ periodStart: r.periodStart, periodEnd: r.periodEnd, status: r.status, metrics: r.metricsJson })) ?? [],
    leadsSummary: {
      total: listing.leads.length,
      hot: listing.leads.filter((lead) => lead.leadScore >= 81).length,
      warm: listing.leads.filter((lead) => lead.leadScore >= 61 && lead.leadScore < 81).length,
      booked: listing.leads.filter((lead) => lead.status === "BOOKED").length
    }
  };
}
