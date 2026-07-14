import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getProductionAdapterSummary } from "@/lib/production-adapters";

export default async function ProductionAdaptersPage() {
  const { agency } = await getCurrentUser();
  const summary = await getProductionAdapterSummary(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Live provider switchboard</p><h1 className="text-3xl font-black">Production Adapterek</h1><p className="mt-2 text-slate-600">Megmutatja, mi fut még mock módban, és mit kell éles providerre kapcsolni.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Adapter score" value={`${summary.score}%`} detail={summary.status} /><MetricCard label="Live" value={summary.live} /><MetricCard label="Partial" value={summary.partial} /><MetricCard label="Mock" value={summary.mock} /></div>
      <Card><h2 className="text-xl font-black">Adapter lista</h2><div className="mt-4 space-y-3">{summary.adapters.map((adapter) => <div key={adapter.adapterKey} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><div><h3 className="font-bold">{adapter.adapterKey}</h3><p className="mt-1 text-sm text-slate-600">{adapter.provider} · {adapter.area}</p></div><StatusPill label={adapter.status} tone={adapter.status === "live" ? "green" : adapter.status === "partial" ? "amber" : "red"} /></div><p className="mt-2 text-sm text-slate-600">{adapter.notes}</p>{adapter.missingEnv.length ? <p className="mt-2 text-xs font-semibold text-red-700">Hiányzó env: {adapter.missingEnv.join(", ")}</p> : <p className="mt-2 text-xs font-semibold text-emerald-700">Live konfiguráció kész.</p>}</div>)}</div></Card>
    </div>
  );
}
