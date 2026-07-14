import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV19Readiness } from "@/lib/spatial-v19";

export default async function V19ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV19Readiness(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V19 enterprise spatial layer</p>
        <h1 className="text-3xl font-black">V19 Digital Twin Production Readiness</h1>
        <p className="mt-2 text-slate-600">A V19 a 3D/digital twin részt production orchestration, lineage, QA review, viewer deploy, SLA és tenant-safe sharing szintre húzza.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="V19 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="Orchestration" value={`${readiness.orchestration.score}%`} detail={readiness.orchestration.status} />
        <MetricCard label="Viewer deploy" value={`${readiness.viewer.score}%`} detail={readiness.viewer.status} />
        <MetricCard label="SLA" value={`${readiness.sla.score}%`} detail={readiness.sla.status} />
      </div>
      <Card>
        <h2 className="text-xl font-black">V19 gate-ek</h2>
        <div className="mt-4 space-y-3">
          {readiness.checks.map((check) => (
            <div key={check.key} className="rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between gap-3"><span className="font-black">{check.label}</span><StatusPill label={check.status} tone={check.status === "passed" ? "green" : check.status === "warning" ? "amber" : "red"} /></div>
              <p className="mt-1 text-slate-600">{check.evidence}</p>
              <p className="mt-1 font-semibold">Score: {check.score}%</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Blokkolók / review pontok</h2>
        {readiness.blockers.length ? <ul className="mt-3 space-y-2 text-sm text-slate-700">{readiness.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}</ul> : <p className="mt-2 text-sm text-emerald-700">Nincs kritikus V19 blocker.</p>}
      </Card>
    </div>
  );
}
