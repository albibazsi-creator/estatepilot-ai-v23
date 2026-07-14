import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getSpatialWorkerHealth } from "../lib/spatial-v17";

async function main() {
  const { agency } = await getCurrentUser();
  const health = await getSpatialWorkerHealth(agency.id);
  console.log(JSON.stringify({ check: "3d-worker", score: health.score, status: health.status, mode: health.mode, missingEnv: health.missingEnv, queue: health.queue }, null, 2));
  if (health.status === "blocked") process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
