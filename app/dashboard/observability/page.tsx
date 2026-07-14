import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSloSummary, ensureSyntheticJourneys } from "@/lib/observability-v12";

export default async function ObservabilityPage() {
  const { agency } = await getCurrentUser();
  const [summary, journeys] = await Promise.all([getSloSummary(agency.id), ensureSyntheticJourneys(agency.id)]);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Observability</p><h1 className="text-3xl font-black">SLO & Synthetic Journeys</h1><p className="mt-2 text-slate-600">Éles demo előtt lásd, mit kell folyamatosan mérni.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="SLO score" value={`${summary.score}%`} detail="30d target" /><MetricCard label="Met" value={summary.met} detail="cél" /><MetricCard label="At risk" value={summary.atRisk} detail="cél" /></div><div className="grid gap-4 md:grid-cols-2"><Card><h2 className="text-xl font-black">SLO célok</h2><div className="mt-4 space-y-3">{summary.targets.map((t) => <div key={t.id} className="rounded-2xl border p-3"><div className="flex justify-between"><b>{t.service}</b><StatusPill label={t.status} tone={t.status === "met" ? "green" : "amber"} /></div><p className="text-sm text-slate-500">{t.metric}: {t.current}% / cél {t.target}%</p></div>)}</div></Card><Card><h2 className="text-xl font-black">Synthetic journeyk</h2><div className="mt-4 space-y-3">{journeys.map((j) => <div key={j.id} className="rounded-2xl border p-3"><b>{j.title}</b><p className="text-sm text-slate-500">{j.status} · {j.schedule}</p></div>)}</div></Card></div></div>;
}
