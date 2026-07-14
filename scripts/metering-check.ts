import { prisma } from "../lib/prisma";
import { getUsageMeteringSummary } from "../lib/usage-metering";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const summary = await getUsageMeteringSummary(agency?.id ?? null);
  console.log(JSON.stringify({ ok: summary.records.length > 0, events: summary.billableEvents, totalCostHuf: summary.totalCostHuf, features: summary.features.map((f) => f.featureKey) }, null, 2));
  if (summary.records.length === 0) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
