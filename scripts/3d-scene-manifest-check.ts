import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { getSceneManifestSummary } from "../lib/spatial-v17";

async function main() {
  const { agency } = await getCurrentUser();
  const summary = await getSceneManifestSummary(agency.id);
  console.log(JSON.stringify({ check: "3d-scene-manifest", scenes: summary.scenes.length, manifests: summary.manifests.length, coverage: summary.manifestCoverage, status: summary.status }, null, 2));
}

main().finally(async () => prisma.$disconnect());
