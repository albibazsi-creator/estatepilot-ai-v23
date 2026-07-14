import { prisma } from "@/lib/prisma";

export async function ensureInvestorDemoMetrics(agencyId: string) {
  const defaults = [
    { metricKey: "active_demo_listings", label: "Demo listingek", value: "3", category: "product", sortOrder: 10, evidenceJson: { source: "seed" } },
    { metricKey: "workflow_coverage", label: "Workflow lefedettség", value: "Listing → Lead → Report → Deal", category: "product", sortOrder: 20, evidenceJson: { modules: ["listing", "lead", "seller_report", "deal_pipeline"] } },
    { metricKey: "enterprise_layers", label: "Enterprise rétegek", value: "Governance, DSR, SLA, API, RBAC", category: "enterprise", sortOrder: 30, evidenceJson: { version: "0.11.0" } },
    { metricKey: "target_intro_price", label: "Bevezető ajánlat", value: "29 900 Ft / ingatlan", category: "go_to_market", sortOrder: 40, evidenceJson: { salesMotion: "manual pilot" } }
  ];
  for (const metric of defaults) {
    const existing = await prisma.investorDemoMetric.findFirst({ where: { agencyId, metricKey: metric.metricKey } });
    if (!existing) await prisma.investorDemoMetric.create({ data: { agencyId, ...metric } });
  }
  return prisma.investorDemoMetric.findMany({ where: { agencyId }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
}

export async function ensureSalesPlaybook(agencyId: string) {
  const defaults = [
    { stage: "opening", title: "Nyitás", script: "Nem szebb képet adunk, hanem mérhetőbb ingatlanértékesítési folyamatot.", objection: "Van már ingatlan.com hirdetésem.", answer: "Pont ezért jó: a landing oldal és riport azt mutatja, ki a komoly érdeklődő.", sortOrder: 10 },
    { stage: "demo", title: "Mutasd a public listinget", script: "Galéria, 360/3D, alaprajz, kérdésküldés és időpontkérés egy oldalon.", objection: "Nincs 360 kamerám.", answer: "MVP-ben Matterport/iframe/360 link elég, saját 360 builder később jön.", sortOrder: 20 },
    { stage: "close", title: "Pilot ajánlat", script: "Egy ingatlanra bevezető csomag: digitális bemutató + lead dashboard + seller report.", objection: "Drága.", answer: "Egy komolyabb lead vagy megbízói bizalom visszahozhatja az árát.", sortOrder: 30 }
  ];
  for (const step of defaults) {
    const existing = await prisma.salesPlaybookStep.findFirst({ where: { agencyId, stage: step.stage, title: step.title } });
    if (!existing) await prisma.salesPlaybookStep.create({ data: { agencyId, persona: "independent_agent", ...step } });
  }
  return prisma.salesPlaybookStep.findMany({ where: { agencyId }, orderBy: { sortOrder: "asc" } });
}

export async function getInvestorDemoPack(agencyId: string) {
  const [metrics, playbook] = await Promise.all([ensureInvestorDemoMetrics(agencyId), ensureSalesPlaybook(agencyId)]);
  return { metrics, playbook };
}
