import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getV17Readiness } from "../lib/spatial-v17";

async function main() {
  const { agency } = await getCurrentUser();
  const readiness = await getV17Readiness(agency.id);
  console.log(JSON.stringify({ check: "v17-readiness", score: readiness.score, status: readiness.status, blockers: readiness.blockers.slice(0, 10) }, null, 2));
  if (readiness.score < 40) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
