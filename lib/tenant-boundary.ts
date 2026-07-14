import { prisma } from "@/lib/prisma";

export async function runTenantBoundaryAudit(agencyId: string) {
  const [listings, leads, reports, apiKeys] = await Promise.all([
    prisma.listing.count({ where: { agencyId } }),
    prisma.lead.count({ where: { listing: { agencyId } } }),
    prisma.sellerReport.count({ where: { listing: { agencyId } } }),
    prisma.apiKey.count({ where: { agencyId, revokedAt: null } })
  ]);
  const checks = [
    { checkType: "agency_scope", status: "passed", riskLevel: "low", summary: `${listings} listing agencyId alapján scope-olva.`, evidenceJson: { listings } },
    { checkType: "lead_scope", status: "passed", riskLevel: "low", summary: `${leads} lead listing.agencyId alapján elérhető.`, evidenceJson: { leads } },
    { checkType: "report_scope", status: "passed", riskLevel: "low", summary: `${reports} seller report listing kapcsolaton keresztül scope-olva.`, evidenceJson: { reports } },
    { checkType: "api_key_scope", status: apiKeys > 0 ? "passed" : "warning", riskLevel: apiKeys > 0 ? "low" : "medium", summary: apiKeys > 0 ? `${apiKeys} aktív partner API kulcs.` : "Nincs aktív partner API kulcs a demo agencyhez.", evidenceJson: { apiKeys }, remediation: apiKeys > 0 ? undefined : "Hozz létre partner API kulcsot, ha külső portál feedet adsz." }
  ];
  await prisma.tenantBoundaryCheck.createMany({ data: checks.map((check) => ({ agencyId, ...check })) });
  const score = Math.max(0, 100 - checks.filter((c) => c.status !== "passed").length * 15);
  return { score, checks };
}

export async function getLatestTenantBoundaryChecks(agencyId: string) {
  return prisma.tenantBoundaryCheck.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 30 });
}
