import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/current-user";
import { createSpatialSharePackage } from "../lib/spatial-v19";

async function main() {
  const { agency } = await getCurrentUser();
  const result = await createSpatialSharePackage(agency.id);
  console.log(JSON.stringify({ check: "3d-sharing", status: result.status, url: result.url }, null, 2));
  if (!result.url) process.exitCode = 1;
}

main().finally(async () => prisma.$disconnect());
