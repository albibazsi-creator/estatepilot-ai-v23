import { prisma } from "../lib/prisma";
import { getSecretRotationSummary } from "../lib/secret-rotation";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const result = await getSecretRotationSummary(agency?.id);
  console.log(JSON.stringify({ ok: true, agency: agency?.name ?? "global", score: result.score, configured: result.configured, total: result.total }, null, 2));
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
