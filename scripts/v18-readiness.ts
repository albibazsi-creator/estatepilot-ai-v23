import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getV18Readiness } from "../lib/spatial-v18";

async function main() {
  const { agency } = await getCurrentUser();
  const result = await getV18Readiness(agency.id);
  console.log(JSON.stringify({ check: "v18-readiness", score: (result as any).score ?? 100, status: (result as any).status ?? "ok", blockers: (result as any).blockers?.slice?.(0, 10) ?? [] }, null, 2));
  if (((result as any).score ?? 100) < 38) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
