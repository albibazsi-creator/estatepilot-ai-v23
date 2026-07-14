import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const agency = await prisma.agency.findFirst();
  if (!agency) throw new Error("No agency found. Run seed first.");
  const checks = {
    aiDecisionLog: await prisma.aiDecisionLog.count({ where: { agencyId: agency.id } }),
    dsr: await prisma.dataSubjectRequest.count({ where: { agencyId: agency.id } }),
    aiEval: await prisma.aiEvaluationRun.count({ where: { agencyId: agency.id } }),
    backup: await prisma.backupSnapshot.count({ where: { agencyId: agency.id } })
  };
  console.log(checks);
  if (Object.values(checks).some((v) => v === 0)) process.exitCode = 1;
}
main().finally(() => prisma.$disconnect());
