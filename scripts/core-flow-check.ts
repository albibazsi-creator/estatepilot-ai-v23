import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { runCorePilotFlow } from "../lib/core-pilot-flow";

async function main() {
  const { agency, user } = await getCurrentUser();
  const result = await runCorePilotFlow(agency.id, user.email);
  console.log(JSON.stringify({ check: "core-flow", score: result.score, status: result.status, failed: result.failed, warnings: result.warnings }, null, 2));
  if (result.score < 55) process.exitCode = 1;
}
main().finally(async () => prisma.$disconnect());
