import { prisma } from "../lib/prisma";
import { generateOpenApiContract, saveApiContractSnapshot } from "../lib/api-contract";

async function main() {
  const agency = await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });
  const generated = generateOpenApiContract();
  if (agency) await saveApiContractSnapshot(agency.id, "contract-check@estatepilot.ai");
  console.log(JSON.stringify({ ok: generated.routeCount >= 20, routeCount: generated.routeCount, discovered: generated.discoveredCount, manual: generated.manualCount, checksum: generated.checksum }, null, 2));
  if (generated.routeCount < 20) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
