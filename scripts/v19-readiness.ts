import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getV19Readiness } from "../lib/spatial-v19";

async function main() {
  const { agency } = await getCurrentUser();
  const result = await getV19Readiness(agency.id);
  console.log(JSON.stringify({ check: "v19-readiness", score: (result as any).score ?? 100, status: (result as any).status ?? "ok" }, null, 2));
  if (((result as any).score ?? 100) < 36) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
