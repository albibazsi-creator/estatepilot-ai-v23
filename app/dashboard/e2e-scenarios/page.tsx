import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV14E2eSummary } from "@/lib/e2e-scenarios-v14";

export default async function E2eScenariosPage() {
  const { agency } = await getCurrentUser();
  const summary = await getV14E2eSummary(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Pilot acceptance</p><h1 className="text-3xl font-black">E2E Scenario Center</h1><p className="mt-2 text-slate-600">A pilot demó legfontosabb útvonalait külön scenario runként naplózza.</p></div>
      <MetricCard label="E2E score" value={`${summary.score}%`} detail="utolsó scenario runok alapján" />
      <Card><h2 className="text-xl font-black">Scenario-k</h2><div className="mt-4 space-y-3">{summary.scenarios.map((scenario) => <div key={scenario.key} className="flex items-center justify-between rounded-2xl border p-4"><div><h3 className="font-bold">{scenario.title}</h3><p className="text-sm text-slate-600">{scenario.lastRunAt ? `Utolsó futás: ${new Date(scenario.lastRunAt).toLocaleString("hu-HU")}` : "Még nincs futtatva"}</p></div><StatusPill label={`${scenario.lastStatus} · ${scenario.lastScore}%`} tone={scenario.lastStatus === "passed" ? "green" : scenario.lastStatus === "warning" ? "amber" : "red"} /></div>)}</div></Card>
    </div>
  );
}
