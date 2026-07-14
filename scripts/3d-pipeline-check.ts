import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getSpatialPipelineSummary } from "../lib/spatial-3d";

async function main() {
  const { agency } = await getCurrentUser();
  const summary = await getSpatialPipelineSummary(agency.id);
  console.log(JSON.stringify({ check: "3d-pipeline", score: summary.score, status: summary.status, stages: summary.stages }, null, 2));
  if (summary.score < 35) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
