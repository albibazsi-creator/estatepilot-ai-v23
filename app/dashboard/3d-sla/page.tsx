import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSpatialSlaDashboard } from "@/lib/spatial-v19";

export default async function SpatialSlaPage() {
  const { agency } = await getCurrentUser();
  const data = await getSpatialSlaDashboard(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Spatial SLA</p><h1 className="text-3xl font-black">3D SLA & Monitoring</h1><p className="mt-2 text-slate-600">A 3D viewer, manifest, artifact CDN, worker és review queue availability alapú figyelése.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="SLA score" value={`${data.score}%`} detail={data.status} /><MetricCard label="Viewer uptime" value={`${data.slo.viewerUptimePct}%`} detail="target" /><MetricCard label="Job success" value={`${data.slo.processingJobSuccessPct}%`} detail="target" /><MetricCard label="P95 latency" value={`${data.slo.targetP95LatencyMs}ms`} detail="target" /></div>
      <Card><h2 className="text-xl font-black">Probe-ok</h2><div className="mt-4 space-y-3">{data.probes.map((probe) => <div key={probe.probeKey} className="rounded-2xl border p-4 text-sm"><div className="flex items-center justify-between"><span className="font-black">{probe.probeKey}</span><StatusPill label={probe.status} tone={probe.status === "ok" ? "green" : probe.status === "mock" ? "amber" : "red"} /></div><p className="mt-1 text-slate-600">{probe.target} • {probe.latencyMs}ms • error {probe.errorRatePct}%</p></div>)}</div></Card>
    </div>
  );
}
