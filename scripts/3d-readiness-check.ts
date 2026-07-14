import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getDigitalTwinReadiness } from "../lib/spatial-3d";

async function main() {
  const { agency } = await getCurrentUser();
  const readiness = await getDigitalTwinReadiness(agency.id);
  console.log(JSON.stringify({ check: "digital-twin-readiness", score: readiness.score, status: readiness.status, blockers: readiness.blockers }, null, 2));
  if (readiness.score < 30) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
