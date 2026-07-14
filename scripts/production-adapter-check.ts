import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getProductionAdapterSummary } from "../lib/production-adapters";

async function main() {
  const { agency } = await getCurrentUser();
  const summary = await getProductionAdapterSummary(agency.id);
  console.log(JSON.stringify({ check: "production-adapters", score: summary.score, live: summary.live, partial: summary.partial, mock: summary.mock, blockers: summary.blockers }, null, 2));
  if (summary.score < 20) process.exitCode = 1;
}
main().finally(async () => prisma.$disconnect());
