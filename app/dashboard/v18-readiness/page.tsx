import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV18Readiness } from "@/lib/spatial-v18";

export default async function V18ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV18Readiness(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V18 highest-level 3D execution</p>
        <h1 className="text-3xl font-black">V18 Digital Twin / Gaussian Splatting Readiness</h1>
        <p className="mt-2 text-slate-600">A V18 már a 3D rekonstrukció éles pilot-szintű összezárása: GPU worker deploy terv, dispatch payload, manifest validation, room graph és acceptance pack.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="V18 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="GPU worker" value={`${readiness.gpu.score}%`} detail={readiness.gpu.status} />
        <MetricCard label="Acceptance" value={`${readiness.acceptance.score}%`} detail={readiness.acceptance.status} />
        <MetricCard label="V17 base" value={`${readiness.v17.score}%`} detail={readiness.v17.status} />
      </div>
      <Card>
        <h2 className="text-xl font-black">V18 gate-ek</h2>
        <div className="mt-4 space-y-3">
          {readiness.checks.map((check) => (
            <div key={check.key} className="rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between"><span className="font-black">{check.label}</span><StatusPill label={check.status} tone={check.status === "passed" ? "green" : check.status === "warning" ? "amber" : "red"} /></div>
              <p className="mt-1 text-slate-600">{check.evidence}</p>
              <p className="mt-1 font-semibold">Score: {check.score}%</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Blokkolók</h2>
        {readiness.blockers.length ? <ul className="mt-3 space-y-2 text-sm text-slate-700">{readiness.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}</ul> : <p className="mt-2 text-sm text-emerald-700">Nincs kritikus V18 blokkoló.</p>}
      </Card>
    </div>
  );
}
