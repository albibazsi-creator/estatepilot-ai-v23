import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { RunProviderCheckButton } from "@/components/dashboard/v12-actions";
import { getCurrentUser } from "@/lib/current-user";
import { getProviderHealthSummary } from "@/lib/provider-health";

export default async function ProvidersPage() {
  const { agency } = await getCurrentUser();
  const summary = await getProviderHealthSummary(agency.id);
  return <div className="space-y-6"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Provider readiness</p><h1 className="text-3xl font-black">Provider Health Matrix</h1><p className="mt-2 text-slate-600">Melyik külső szolgáltató van mock, partial vagy live állapotban.</p></div><RunProviderCheckButton /></div><div className="grid gap-4 md:grid-cols-4"><MetricCard label="Score" value={`${summary.score}%`} detail="provider readiness" /><MetricCard label="Ready" value={summary.ready} detail="live-kész" /><MetricCard label="Partial" value={summary.partial} detail="hiányos" /><MetricCard label="Mock" value={summary.mock} detail="fallback" /></div><Card><div className="space-y-3">{summary.checks.map((c: any) => <div key={c.id ?? `${c.provider}-${c.area}`} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><b>{c.provider}</b><p className="text-sm text-slate-500">{c.area} · mód: {c.mode}</p></div><StatusPill label={c.status} tone={c.status === "ready" ? "green" : c.status === "partial" ? "amber" : "red"} /></div>{Array.isArray(c.missingEnv ?? c.missingEnvJson) && (c.missingEnv ?? c.missingEnvJson).length ? <p className="mt-2 text-sm text-rose-700">Hiányzó ENV: {(c.missingEnv ?? c.missingEnvJson).join(", ")}</p> : null}<p className="mt-2 text-sm text-slate-600">{c.remediation}</p></div>)}</div></Card></div>;
}
