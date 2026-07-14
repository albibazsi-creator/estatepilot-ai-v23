import { prisma } from "../lib/prisma";
import { runProviderHealthCheck } from "../lib/provider-health";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const checks = await runProviderHealthCheck(agency?.id);
  console.log(JSON.stringify({ ok: true, agency: agency?.name ?? "global", total: checks.length, ready: checks.filter((c) => c.status === "ready").length, mock: checks.filter((c) => c.status === "mock").length }, null, 2));
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
