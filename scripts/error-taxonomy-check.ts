import { prisma } from "../lib/prisma";
import { getErrorTaxonomySummary } from "../lib/error-taxonomy";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const summary = await getErrorTaxonomySummary(agency?.id ?? null);
  console.log(JSON.stringify({ ok: summary.total >= 10, total: summary.total, high: summary.high, retryable: summary.retryable, score: summary.score }, null, 2));
  if (summary.total < 8) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
