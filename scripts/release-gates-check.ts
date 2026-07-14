import { prisma } from "../lib/prisma";
import { runV13ReleaseGates } from "../lib/release-gates-v13";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const result = await runV13ReleaseGates(agency?.id ?? null, "release-gate@estatepilot.ai");
  console.log(JSON.stringify({ ok: result.status !== "failed", status: result.status, score: result.score, failed: result.failed.map((f) => f.key) }, null, 2));
  if (result.status === "failed") process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
