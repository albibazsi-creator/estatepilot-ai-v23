import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { runV14E2eScenarios } from "../lib/e2e-scenarios-v14";

async function main() {
  const { agency, user } = await getCurrentUser();
  const runs = await runV14E2eScenarios(agency.id, user.email);
  console.log(JSON.stringify({ check: "v14-e2e", scenarios: runs.map((r) => ({ key: r.scenario.key, status: r.status, score: r.score })) }, null, 2));
  if (runs.every((r) => r.status === "failed")) process.exitCode = 1;
}
main().finally(async () => prisma.$disconnect());
