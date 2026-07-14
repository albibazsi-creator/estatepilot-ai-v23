import { writeFileSync, mkdirSync } from "fs";
import { prisma } from "../lib/prisma";
import { getV11Readiness } from "../lib/v11-readiness";
import { getInvestorDemoPack } from "../lib/investor-demo";
import { createSandboxResetPlan } from "../lib/sandbox";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  if (!agency) throw new Error("No agency found");
  const payload = { agency: agency.name, generatedAt: new Date().toISOString(), readiness: await getV11Readiness(agency.id), investorDemo: await getInvestorDemoPack(agency.id), sandbox: await createSandboxResetPlan(agency.id) };
  mkdirSync("release", { recursive: true });
  writeFileSync("release/v11-launch-package.json", JSON.stringify(payload, null, 2));
  console.log("release/v11-launch-package.json generated");
}
main().finally(() => prisma.$disconnect());
