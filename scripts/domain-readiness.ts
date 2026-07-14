import { prisma } from "../lib/prisma";
import { getDomainReadiness } from "../lib/domain-readiness";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const result = await getDomainReadiness(agency?.id);
  console.log(JSON.stringify({ ok: true, agency: agency?.name ?? "global", score: result.score, status: result.status, domains: result.domains.length }, null, 2));
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
