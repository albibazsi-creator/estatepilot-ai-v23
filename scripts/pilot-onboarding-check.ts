import { prisma } from "../lib/prisma";
import { getPilotOnboardingSummary } from "../lib/pilot-onboarding";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const summary = await getPilotOnboardingSummary(agency?.id ?? null);
  console.log(JSON.stringify({ ok: summary.total >= 7 && summary.blocked === 0, total: summary.total, done: summary.done, overdue: summary.overdue, score: summary.score, status: summary.status }, null, 2));
  if (summary.total < 7 || summary.blocked > 0) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
