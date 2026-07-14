import { prisma } from "@/lib/prisma";
import { getCorePilotStatus } from "@/lib/core-pilot-flow";

export type E2eScenarioStep = { key: string; label: string; status: "passed" | "warning" | "failed"; evidence: string };

const scenarios = [
  { key: "agent_listing_to_public_lead", title: "Agent feltöltés → publikus lead" },
  { key: "lead_to_seller_report", title: "Lead → scoring → seller report" },
  { key: "provider_switch_dry_run", title: "Mock provider → live provider dry-run" },
  { key: "sales_demo_12min", title: "12 perces értékesítési demo" }
];

export async function runV14E2eScenarios(agencyId: string, runByEmail?: string) {
  const started = Date.now();
  const core = await getCorePilotStatus(agencyId);
  const latestAdapterConfigs = await prisma.productionAdapterConfig.findMany({ where: { agencyId } });
  const runs = [];

  for (const scenario of scenarios) {
    const steps: E2eScenarioStep[] = [];
    if (scenario.key === "agent_listing_to_public_lead") {
      steps.push({ key: "listing", label: "Van pilot listing", status: core.checks.find((c) => c.key === "listing_created")?.status ?? "failed", evidence: core.checks.find((c) => c.key === "listing_created")?.evidence ?? "Nincs adat" });
      steps.push({ key: "media", label: "Galéria és cover", status: core.checks.find((c) => c.key === "media_ready")?.status ?? "failed", evidence: core.checks.find((c) => c.key === "media_ready")?.evidence ?? "Nincs adat" });
      steps.push({ key: "lead", label: "Teszt lead beküldve", status: core.checks.find((c) => c.key === "lead_capture")?.status ?? "failed", evidence: core.checks.find((c) => c.key === "lead_capture")?.evidence ?? "Nincs adat" });
    } else if (scenario.key === "lead_to_seller_report") {
      steps.push({ key: "lead_scoring", label: "Lead scoring", status: core.checks.find((c) => c.key === "lead_scoring")?.status ?? "failed", evidence: core.checks.find((c) => c.key === "lead_scoring")?.evidence ?? "Nincs adat" });
      steps.push({ key: "seller_report", label: "Seller report", status: core.checks.find((c) => c.key === "seller_report")?.status ?? "failed", evidence: core.checks.find((c) => c.key === "seller_report")?.evidence ?? "Nincs adat" });
    } else if (scenario.key === "provider_switch_dry_run") {
      const live = latestAdapterConfigs.filter((a) => a.status === "live").length;
      const mock = latestAdapterConfigs.filter((a) => a.status === "mock").length;
      steps.push({ key: "adapter_inventory", label: "Adapter inventory friss", status: latestAdapterConfigs.length ? "passed" : "warning", evidence: `${latestAdapterConfigs.length} adapter config` });
      steps.push({ key: "critical_live", label: "Kritikus providerek live/partial", status: mock <= 2 ? "warning" : "failed", evidence: `${live} live, ${mock} mock` });
    } else {
      steps.push({ key: "core_score", label: "Core pilot score", status: core.score >= 80 ? "passed" : core.score >= 60 ? "warning" : "failed", evidence: `${core.score}%` });
      steps.push({ key: "blockers", label: "Demo blocker lista", status: core.blockers.length === 0 ? "passed" : "warning", evidence: `${core.blockers.length} blocker` });
    }

    const score = Math.round(steps.reduce((sum, step) => sum + (step.status === "passed" ? 100 : step.status === "warning" ? 60 : 0), 0) / Math.max(1, steps.length));
    const status = steps.some((s) => s.status === "failed") ? (score >= 60 ? "warning" : "failed") : steps.some((s) => s.status === "warning") ? "warning" : "passed";
    const run = await prisma.e2eScenarioRun.create({ data: { agencyId, scenarioKey: scenario.key, status, score, durationMs: Date.now() - started, stepsJson: steps, artifactsJson: { title: scenario.title, coreScore: core.score }, runByEmail } });
    runs.push({ scenario, run, steps, score, status });
  }
  return runs;
}

export async function getV14E2eSummary(agencyId: string) {
  const recent = await prisma.e2eScenarioRun.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" }, take: 12 });
  const grouped = scenarios.map((scenario) => {
    const last = recent.find((run) => run.scenarioKey === scenario.key);
    return { ...scenario, lastStatus: last?.status ?? "not_run", lastScore: last?.score ?? 0, lastRunAt: last?.createdAt ?? null };
  });
  const score = Math.round(grouped.reduce((sum, item) => sum + item.lastScore, 0) / Math.max(1, grouped.length));
  return { score, scenarios: grouped, recent };
}
