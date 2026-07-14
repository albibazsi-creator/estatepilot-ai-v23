import { prisma } from "../lib/prisma";
import { runTenantBoundaryAudit } from "../lib/tenant-boundary";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  if (!agency) throw new Error("No agency found");
  const result = await runTenantBoundaryAudit(agency.id);
  console.log(JSON.stringify(result, null, 2));
  if (result.score < 70) throw new Error(`Tenant boundary score too low: ${result.score}`);
}
main().finally(() => prisma.$disconnect());
