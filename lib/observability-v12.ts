import { prisma } from "@/lib/prisma";

const defaultTargets = [
  { service: "public_listing", metric: "availability_percent", target: 99, current: 100 },
  { service: "lead_capture", metric: "success_percent", target: 99, current: 98 },
  { service: "ai_jobs", metric: "success_percent", target: 95, current: 90 },
  { service: "seller_reports", metric: "generation_success_percent", target: 95, current: 92 },
  { service: "checkout", metric: "success_percent", target: 98, current: 70 }
];

export async function ensureSloTargets(agencyId?: string | null) {
  const rows = [];
  for (const item of defaultTargets) {
    rows.push(await prisma.sloTarget.upsert({
      where: { agencyId_service_metric_window: { agencyId: agencyId ?? null, service: item.service, metric: item.metric, window: "30d" } },
      create: { agencyId: agencyId ?? null, ...item, status: item.current >= item.target ? "met" : "at_risk", window: "30d", evidenceJson: { source: "demo_metrics" } },
      update: {}
    }));
  }
  return rows;
}

export async function getSloSummary(agencyId?: string | null) {
  const targets = await ensureSloTargets(agencyId);
  const met = targets.filter((t) => t.status === "met").length;
  const atRisk = targets.filter((t) => t.status !== "met").length;
  const score = Math.round((met * 100 + atRisk * 55) / Math.max(1, targets.length));
  return { targets, met, atRisk, score };
}

export async function ensureSyntheticJourneys(agencyId?: string | null) {
  const journeys = [
    { key: "buyer_lead_flow", title: "Buyer lead flow", stepsJson: ["open_listing", "submit_gdpr_lead", "create_score", "notify_agent"], status: "active", schedule: "hourly_candidate" },
    { key: "agent_demo_flow", title: "Agent demo flow", stepsJson: ["login", "open_dashboard", "create_listing", "generate_report"], status: "manual", schedule: "manual" },
    { key: "seller_portal_flow", title: "Seller portal flow", stepsJson: ["open_seller_token", "view_metrics", "download_report"], status: "manual", schedule: "daily_candidate" }
  ];
  const rows = [];
  for (const j of journeys) {
    rows.push(await prisma.syntheticJourney.upsert({
      where: { agencyId_key: { agencyId: agencyId ?? null, key: j.key } },
      create: { agencyId: agencyId ?? null, ...j },
      update: {}
    }));
  }
  return rows;
}
