import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { getUsageMeteringSummary } from "@/lib/usage-metering";

export default async function MeteringPage() {
  const { agency } = await getCurrentUser();
  const summary = await getUsageMeteringSummary(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Unit economics</p><h1 className="text-3xl font-black">Usage Metering</h1><p className="mt-2 text-slate-600">AI, lead, listing, report és kampány használat becsült költsége pilot és pricing validáláshoz.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Metering score" value={`${summary.score}%`} detail={summary.status} /><MetricCard label="Események" value={summary.billableEvents} /><MetricCard label="Becsült költség" value={`${summary.totalCostHuf} Ft`} /><MetricCard label="Feature" value={summary.features.length} /></div>
      <Card><h2 className="text-xl font-black">Feature cost breakdown</h2><div className="mt-4 space-y-3">{summary.features.map((f) => <div key={f.featureKey} className="grid gap-2 rounded-2xl border p-4 text-sm md:grid-cols-4"><b>{f.featureKey}</b><span>{f.quantity} {f.unit}</span><span>{f.estimatedCostHuf} Ft</span><span>{f.quantity ? Math.round(f.estimatedCostHuf / f.quantity) : 0} Ft / {f.unit}</span></div>)}</div></Card>
    </div>
  );
}
