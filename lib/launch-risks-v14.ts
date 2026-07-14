import { prisma } from "@/lib/prisma";
import { getCorePilotStatus } from "@/lib/core-pilot-flow";
import { getProductionAdapterSummary } from "@/lib/production-adapters";

const defaultRisks = [
  { key: "build_not_verified", title: "Teljes npm install/build még nincs bizonyítva", severity: "critical", ownerArea: "engineering", mitigation: "Futtasd: npm ci, prisma validate, db push, seed, release:v14-check, build." },
  { key: "dev_auth_only", title: "Dev auth nem elég éles ügyfélhez", severity: "critical", ownerArea: "platform", mitigation: "Clerk vagy Auth.js session + role middleware." },
  { key: "mock_ai_provider", title: "AI provider mock módban", severity: "high", ownerArea: "ai", mitigation: "OpenAI API kulcs + vision/text wrapper + fallback policy." },
  { key: "local_storage_only", title: "Média upload nem cloud storage-on fut", severity: "high", ownerArea: "platform", mitigation: "R2/S3 presigned upload, CDN, thumbnail pipeline." },
  { key: "seller_report_not_sent", title: "Seller report email/PDF export még nem bizonyított", severity: "medium", ownerArea: "growth", mitigation: "Resend + PDF render e2e acceptance teszt." }
];

export async function syncLaunchRisks(agencyId: string) {
  const [core, adapters] = await Promise.all([getCorePilotStatus(agencyId), getProductionAdapterSummary(agencyId)]);
  for (const risk of defaultRisks) {
    let status = "open";
    if (risk.key === "mock_ai_provider" && adapters.adapters.find((a) => a.adapterKey === "ai.vision_text")?.status === "live") status = "mitigated";
    if (risk.key === "local_storage_only" && adapters.adapters.find((a) => a.adapterKey === "storage.media")?.status === "live") status = "mitigated";
    if (risk.key === "seller_report_not_sent" && core.checks.find((c) => c.key === "seller_report")?.status === "passed") status = "watch";
    await prisma.launchRiskItem.upsert({
      where: { agencyId_key: { agencyId, key: risk.key } },
      update: { title: risk.title, severity: risk.severity, ownerArea: risk.ownerArea, mitigation: risk.mitigation, status, evidenceJson: { coreScore: core.score, adapterScore: adapters.score } },
      create: { agencyId, ...risk, status, evidenceJson: { coreScore: core.score, adapterScore: adapters.score } }
    });
  }
  return getLaunchRiskSummary(agencyId);
}

export async function getLaunchRiskSummary(agencyId: string) {
  const risks = await prisma.launchRiskItem.findMany({ where: { agencyId }, orderBy: [{ severity: "asc" }, { createdAt: "desc" }] });
  const open = risks.filter((r) => r.status === "open");
  const critical = open.filter((r) => r.severity === "critical").length;
  const high = open.filter((r) => r.severity === "high").length;
  const score = Math.max(0, 100 - critical * 25 - high * 14 - open.filter((r) => r.severity === "medium").length * 7);
  return { score, status: critical ? "blocked" : high ? "at_risk" : "controlled", critical, high, open: open.length, risks };
}
