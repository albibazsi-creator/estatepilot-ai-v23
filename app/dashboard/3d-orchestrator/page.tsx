import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { buildSpatialProductionOrchestration } from "@/lib/spatial-v19";

export default async function SpatialOrchestratorPage() {
  const { agency } = await getCurrentUser();
  const data = await buildSpatialProductionOrchestration(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D production orchestration</p><h1 className="text-3xl font-black">Digital Twin Orchestrator</h1><p className="mt-2 text-slate-600">A capture inputtól a GPU/provider dispatch-en át a QA review és viewer publikálásig egyben tartja a 3D folyamatot.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Score" value={`${data.score}%`} detail={data.status} /><MetricCard label="Mode" value={data.mode} detail={data.contractVersion} /><MetricCard label="Cost est." value={`${data.costEstimateHuf.toLocaleString("hu-HU")} Ft`} detail="3D processing becslés" /><MetricCard label="Checksum" value={data.checksum.slice(0, 8)} detail="orchestration integrity" /></div>
      <Card><h2 className="text-xl font-black">Stage plan</h2><div className="mt-4 space-y-3">{data.stagePlan.map((stage) => <div key={stage.key} className="rounded-2xl border p-4 text-sm"><div className="flex items-center justify-between"><span className="font-black">{stage.label}</span><StatusPill label={stage.status} tone={stage.blocking ? "amber" : "green"} /></div><p className="mt-1 text-slate-600">Owner: {stage.owner} {stage.blocking ? "• blocking gate" : ""}</p></div>)}</div></Card>
      <Card><h2 className="text-xl font-black">Riskek</h2><pre className="mt-4 max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(data.riskJson, null, 2)}</pre></Card>
    </div>
  );
}
