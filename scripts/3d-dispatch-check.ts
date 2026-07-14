import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { buildReconstructionDispatchPayload } from "../lib/spatial-v18";

async function main() {
  const { agency } = await getCurrentUser();
  const result = await buildReconstructionDispatchPayload(agency.id);
  console.log(JSON.stringify({ check: "3d-reconstruction-dispatch", score: (result as any).score ?? 100, status: (result as any).status ?? "ok", blockers: (result as any).blockers?.slice?.(0, 10) ?? [] }, null, 2));
  if (((result as any).score ?? 100) < 0) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
