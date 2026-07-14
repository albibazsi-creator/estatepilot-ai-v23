import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getErrorTaxonomySummary } from "@/lib/error-taxonomy";

export default async function ErrorTaxonomyPage() {
  const { agency } = await getCurrentUser();
  const summary = await getErrorTaxonomySummary(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Reliability</p><h1 className="text-3xl font-black">Error Taxonomy</h1><p className="mt-2 text-slate-600">Egységes hibakódok az API-khoz, AI fallbackhez, billinghez, storage-hoz és GDPR flow-hoz.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Score" value={`${summary.score}%`} detail={summary.status} /><MetricCard label="Kódok" value={summary.total} /><MetricCard label="High severity" value={summary.high} /><MetricCard label="Retryable" value={summary.retryable} /></div>
      <Card><h2 className="text-xl font-black">Hibakód lista</h2><div className="mt-4 space-y-3">{summary.items.map((item) => <div key={item.code} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><b>{item.code}</b><div className="flex gap-2"><StatusPill label={item.category} tone="blue" /><StatusPill label={item.severity} tone={item.severity === "high" ? "red" : item.severity === "medium" ? "amber" : "slate"} /></div></div><p className="mt-2 text-sm text-slate-600">{item.publicMessage}</p><p className="mt-1 text-xs text-slate-500">HTTP {item.httpStatus} · owner: {item.ownerArea} · retry: {item.isRetryable ? "igen" : "nem"}</p></div>)}</div></Card>
    </div>
  );
}
