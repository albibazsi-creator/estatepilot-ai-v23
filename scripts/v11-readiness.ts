import { prisma } from "../lib/prisma";
import { getV11Readiness } from "../lib/v11-readiness";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  if (!agency) throw new Error("No agency found. Run npm run db:seed first.");
  const readiness = await getV11Readiness(agency.id);
  console.log(JSON.stringify(readiness, null, 2));
  if (readiness.score < 50) throw new Error(`V11 readiness too low: ${readiness.score}`);
}
main().finally(() => prisma.$disconnect());
