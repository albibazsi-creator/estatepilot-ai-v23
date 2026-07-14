import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getSpatialQualitySummary } from "../lib/spatial-v17";

async function main() {
  const { agency } = await getCurrentUser();
  const quality = await getSpatialQualitySummary(agency.id);
  console.log(JSON.stringify({ check: "3d-quality", score: quality.score, status: quality.status, warnings: quality.warnings, gates: quality.gates }, null, 2));
  if (quality.score < 35) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
