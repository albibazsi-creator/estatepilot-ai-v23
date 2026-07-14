import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { buildViewerDeploymentPlan } from "../lib/spatial-v19";

async function main() {
  const { agency } = await getCurrentUser();
  const result = await buildViewerDeploymentPlan(agency.id);
  console.log(JSON.stringify({ check: "3d-viewer-deploy", score: (result as any).score ?? 100, status: (result as any).status ?? "ok" }, null, 2));
  if (((result as any).score ?? 100) < 35) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
