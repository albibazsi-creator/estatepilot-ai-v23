import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { syncLaunchRisks } from "../lib/launch-risks-v14";

async function main() {
  const { agency } = await getCurrentUser();
  const risks = await syncLaunchRisks(agency.id);
  console.log(JSON.stringify({ check: "launch-risks", score: risks.score, status: risks.status, critical: risks.critical, high: risks.high, open: risks.open }, null, 2));
}
main().finally(async () => prisma.$disconnect());
