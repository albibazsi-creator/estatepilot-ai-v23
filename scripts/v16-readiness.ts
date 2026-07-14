import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getV16Readiness } from "../lib/v16-readiness";

async function main() {
  const { agency } = await getCurrentUser();
  const readiness = await getV16Readiness(agency.id);
  console.log(JSON.stringify({ check: "v16-readiness", score: readiness.score, status: readiness.status, blockers: readiness.blockers.slice(0, 10) }, null, 2));
  if (readiness.score < 40) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
