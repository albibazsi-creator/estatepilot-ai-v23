import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSpatialPipelineSummary } from "@/lib/spatial-3d";

export default async function ThreeDPipelinePage() {
  const { agency } = await getCurrentUser();
  const summary = await getSpatialPipelineSummary(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D processing operations</p>
        <h1 className="text-3xl font-black">Spatial Pipeline</h1>
        <p className="mt-2 text-slate-600">Capture → input validation → Gaussian Splatting / külső 3D API → viewer delivery → compliance approval.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Pipeline score" value={`${summary.score}%`} detail={summary.status} />
        <MetricCard label="Listings" value={summary.listings.length} detail="agency scope" />
        <MetricCard label="Provider live" value={summary.providers.filter((provider) => provider.status === "live").length} detail={`${summary.providers.length} összesen`} />
        <MetricCard label="Digital twin" value={`${summary.readiness.score}%`} detail={summary.readiness.status} />
      </div>
      <Card>
        <h2 className="text-xl font-black">Pipeline stage-ek</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {summary.stages.map((stage) => (
            <div key={stage.key} className="rounded-2xl border p-4">
              <StatusPill label={stage.status} tone={stage.status === "live" ? "green" : stage.status === "partial" ? "amber" : "red"} />
              <h3 className="mt-3 font-black">{stage.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{stage.detail}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Provider adapterek</h2>
        <div className="mt-4 space-y-3">
          {summary.providers.map((provider) => (
            <div key={provider.providerKey} className="rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between"><span className="font-black">{provider.providerName}</span><StatusPill label={provider.status} tone={provider.status === "live" ? "green" : provider.status === "partial" ? "amber" : "red"} /></div>
              <p className="mt-1 text-slate-600">{provider.capabilities.join(" • ")}</p>
              <p className="mt-1 font-semibold text-slate-800">{provider.nextAction}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
