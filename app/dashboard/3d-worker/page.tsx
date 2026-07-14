import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSpatialWorkerHealth } from "@/lib/spatial-v17";

export default async function ThreeDWorkerPage() {
  const { agency } = await getCurrentUser();
  const health = await getSpatialWorkerHealth(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D worker operations</p>
        <h1 className="text-3xl font-black">Gaussian Splatting Worker</h1>
        <p className="mt-2 text-slate-600">Job létrehozás, worker health, provider dry-run és queue állapot a videóból/fotókból készülő 3D scene-hez.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Worker score" value={`${health.score}%`} detail={health.status} />
        <MetricCard label="Queue" value={health.queue.recent} detail={`${health.queue.running} running / ${health.queue.failed} failed`} />
        <MetricCard label="Mode" value={health.mode} detail={health.baseUrl} />
        <MetricCard label="Limit" value={health.limits.maxInputAssets} detail="max input asset" />
      </div>
      <Card>
        <h2 className="text-xl font-black">Capabilities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {health.capabilities.map((capability) => <StatusPill key={capability} label={capability} tone="blue" />)}
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">{health.nextAction}</p>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Provider dependency állapot</h2>
        <div className="mt-4 space-y-2 text-sm">
          {health.providers.map((provider) => <div key={provider.key} className="flex items-center justify-between rounded-2xl border p-3"><span>{provider.key}</span><StatusPill label={provider.status} tone={provider.status === "live" ? "green" : provider.status === "partial" ? "amber" : "red"} /></div>)}
        </div>
      </Card>
    </div>
  );
}
