import { prisma } from "../lib/prisma";
import { runAcceptanceSuite } from "../lib/acceptance-tests";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  if (!agency) throw new Error("No agency found. Run npm run db:seed first.");
  const result = await runAcceptanceSuite(agency.id, "cli@estatepilot.local");
  console.log(JSON.stringify({ ok: result.failed === 0, score: result.score, status: result.status, passed: result.passed, warnings: result.warnings, failed: result.failed }, null, 2));
  if (result.failed > 0) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
