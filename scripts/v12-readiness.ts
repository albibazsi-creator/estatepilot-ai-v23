import { prisma } from "../lib/prisma";
import { getV12Readiness } from "../lib/v12-readiness";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  if (!agency) throw new Error("No agency found. Run npm run db:seed first.");
  const result = await getV12Readiness(agency.id);
  console.log(JSON.stringify({ ok: result.score >= 70, agency: agency.name, score: result.score, status: result.status, blockers: result.blockers }, null, 2));
  if (result.score < 60) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
