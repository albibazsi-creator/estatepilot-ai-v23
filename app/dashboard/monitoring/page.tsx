import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getMonitoringSummary } from "@/lib/monitoring";

export default async function MonitoringPage() {
  const { agency } = await getCurrentUser();
  const data = await getMonitoringSummary(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 monitoring</p><h1 className="text-3xl font-black">Monitoring & Uptime Probes</h1><p className="mt-2 text-slate-600">Éles deploy előtt szükséges probe-ok, latency és státusz összefoglaló.</p></div><div className="grid gap-4 md:grid-cols-4"><MetricCard label="Overall" value={data.summary.status} detail="demo-ready status" /><MetricCard label="Probes" value={data.summary.total} detail="monitorozott cél" /><MetricCard label="Avg latency" value={`${data.summary.avgLatency} ms`} detail="demo mérés" /><MetricCard label="Unhealthy" value={data.summary.unhealthy} detail="figyelendő" /></div><Card><div className="space-y-3">{data.probes.map((probe) => <div key={probe.id} className="flex items-center justify-between rounded-2xl border p-4"><div><p className="font-black">{probe.name}</p><p className="text-sm text-slate-500">{probe.target} • uptime {probe.uptimePercent}%</p></div><div className="text-right"><StatusPill status={probe.status} /><p className="mt-1 text-xs text-slate-500">{probe.latencyMs ?? 0} ms</p></div></div>)}</div></Card></div>;
}
