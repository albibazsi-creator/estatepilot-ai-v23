import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV16Readiness } from "@/lib/v16-readiness";

export default async function V16ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV16Readiness(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V16 spatial intelligence</p>
        <h1 className="text-3xl font-black">V16 3D / Digital Twin Readiness</h1>
        <p className="mt-2 text-slate-600">A v16 a 3D modellterves részt húzza fel: guided capture, 360 tour, külső 3D provider, Gaussian Splatting worker és digital twin audit.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="V16 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="Digital twin" value={`${readiness.digitalTwin.score}%`} detail={`${readiness.digitalTwin.failed} failed`} />
        <MetricCard label="3D pipeline" value={`${readiness.pipeline.score}%`} detail={readiness.pipeline.status} />
        <MetricCard label="Provider score" value={`${readiness.providerScore}%`} detail={`${readiness.liveReconstruction} live reconstruction`} />
        <MetricCard label="V14 core" value={`${readiness.v14.score}%`} detail={readiness.v14.status} />
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">3D élesítési blockerek</h2>
          <StatusPill label={readiness.status} tone={readiness.status === "spatial_pilot_ready" ? "green" : readiness.status === "3d_dry_run_ready" ? "amber" : "red"} />
        </div>
        <div className="mt-4 space-y-2">
          {readiness.blockers.length ? readiness.blockers.map((blocker) => (
            <div key={blocker} className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{blocker}</div>
          )) : <p className="text-sm font-semibold text-emerald-700">Nincs 3D blocker. Mehet a spatial pilot.</p>}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Digital twin audit</h2>
          <div className="mt-4 space-y-3">
            {readiness.digitalTwin.checks.map((check) => (
              <div key={check.key} className="rounded-2xl border p-3 text-sm">
                <div className="flex items-center justify-between"><span className="font-bold">{check.label}</span><StatusPill label={check.status} tone={check.status === "passed" ? "green" : check.status === "warning" ? "amber" : "red"} /></div>
                <p className="mt-1 text-slate-600">{check.evidence}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">3D provider matrix</h2>
          <div className="mt-4 space-y-3">
            {readiness.providers.map((provider) => (
              <div key={provider.providerKey} className="rounded-2xl border p-3 text-sm">
                <div className="flex items-center justify-between"><span className="font-bold">{provider.providerName}</span><StatusPill label={provider.status} tone={provider.status === "live" ? "green" : provider.status === "partial" ? "amber" : "red"} /></div>
                <p className="mt-1 text-slate-600">{provider.notes}</p>
                {provider.missingEnv.length ? <p className="mt-1 text-xs font-semibold text-red-700">Hiányzó env: {provider.missingEnv.join(", ")}</p> : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
