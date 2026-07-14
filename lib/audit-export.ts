import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function generateEnterpriseAuditBundle(agencyId: string, requestedByEmail?: string) {
  const [agency, listings, leads, decisions, dsr, checks, budgets, releases] = await Promise.all([
    prisma.agency.findUnique({ where: { id: agencyId } }),
    prisma.listing.count({ where: { agencyId } }),
    prisma.lead.count({ where: { listing: { agencyId } } }),
    prisma.aiDecisionLog.count({ where: { agencyId } }),
    prisma.dataSubjectRequest.count({ where: { agencyId } }),
    prisma.tenantBoundaryCheck.count({ where: { agencyId } }),
    prisma.aiCostBudget.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.releaseChannel.findMany({ take: 5, orderBy: { updatedAt: "desc" } })
  ]);
  const payload = { generatedAt: new Date().toISOString(), agency: agency?.name ?? agencyId, counts: { listings, leads, aiDecisions: decisions, dsr, tenantBoundaryChecks: checks }, budgets, releases, notes: "V11 audit bundle: demo/enterprise due diligence export." };
  const json = JSON.stringify(payload);
  const checksum = createHash("sha256").update(json).digest("hex");
  return prisma.auditExportBundle.create({ data: { agencyId, exportType: "enterprise_audit", status: "generated", fileName: `estatepilot-audit-${agencyId}-${Date.now()}.json`, checksum, payloadJson: payload, requestedByEmail } });
}
