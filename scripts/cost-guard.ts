import { prisma } from "../lib/prisma";
import { getCostControlSummary } from "../lib/cost-control";

async function main() {
  const agencies = await prisma.agency.findMany();
  for (const agency of agencies) {
    const summary = await getCostControlSummary(agency.id);
    console.log(`${agency.name}: ${summary.status.state} (${summary.status.percent}%)`);
    if (summary.status.state === "blocked") throw new Error(`AI hard limit reached for ${agency.name}`);
  }
}
main().finally(() => prisma.$disconnect());
