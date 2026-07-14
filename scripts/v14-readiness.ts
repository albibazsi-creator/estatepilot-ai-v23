import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getV14Readiness } from "../lib/v14-readiness";

async function main() {
  const { agency } = await getCurrentUser();
  const readiness = await getV14Readiness(agency.id);
  console.log(JSON.stringify({ check: "v14-readiness", score: readiness.score, status: readiness.status, blockers: readiness.blockers.slice(0, 8) }, null, 2));
  if (readiness.score < 50) process.exitCode = 1;
}
main().finally(async () => prisma.$disconnect());
