import { prisma } from "../lib/prisma";
import { getSloSummary, ensureSyntheticJourneys } from "../lib/observability-v12";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const [slo, journeys] = await Promise.all([getSloSummary(agency?.id), ensureSyntheticJourneys(agency?.id)]);
  console.log(JSON.stringify({ ok: true, agency: agency?.name ?? "global", score: slo.score, atRisk: slo.atRisk, journeys: journeys.length }, null, 2));
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
