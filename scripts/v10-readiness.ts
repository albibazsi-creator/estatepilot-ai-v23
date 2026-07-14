import { PrismaClient } from "@prisma/client";
import { calculateV10Readiness } from "../lib/v10-readiness";
const prisma = new PrismaClient();
async function main() {
  const agency = await prisma.agency.findFirst();
  if (!agency) throw new Error("No agency found. Run npm run db:seed first.");
  const result = await calculateV10Readiness(agency.id);
  console.log(JSON.stringify(result, null, 2));
  if (result.score < 70) process.exitCode = 1;
}
main().finally(() => prisma.$disconnect());
