import { prisma } from "@/lib/prisma";

export async function ensureProductionDomains(agencyId?: string | null) {
  const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "app.estatepilot.ai";
  const listingDomain = process.env.NEXT_PUBLIC_LISTING_DOMAIN || "listings.estatepilot.ai";
  const items = [
    { domain: appDomain, purpose: "app", dnsTarget: "Vercel/Netlify production target" },
    { domain: listingDomain, purpose: "public_listings", dnsTarget: "CNAME to app host" }
  ];
  const rows = [];
  for (const item of items) {
    rows.push(await prisma.productionDomain.upsert({
      where: { agencyId_domain_purpose: { agencyId: agencyId ?? null, domain: item.domain, purpose: item.purpose } },
      create: { agencyId: agencyId ?? null, ...item, status: "planned", sslStatus: "unknown", metadataJson: { expectedRecords: ["CNAME/A", "HTTPS redirect", "SSL auto-renew"] } },
      update: {}
    }));
  }
  return rows;
}

export async function getDomainReadiness(agencyId?: string | null) {
  const domains = await ensureProductionDomains(agencyId);
  const verified = domains.filter((d) => d.status === "verified" && d.sslStatus === "valid").length;
  const score = Math.round((verified * 100 + (domains.length - verified) * 30) / Math.max(1, domains.length));
  return { domains, verified, score, status: verified === domains.length ? "ready" : "needs_dns_ssl" };
}
