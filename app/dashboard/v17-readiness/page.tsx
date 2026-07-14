import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV17Readiness } from "@/lib/spatial-v17";

export default async function V17ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV17Readiness(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V17 3D execution layer</p>
        <h1 className="text-3xl font-black">V17 Spatial Worker Readiness</h1>
        <p className="mt-2 text-slate-600">A V16 3D előkészítés után itt már konkrét processing job, worker dispatch, scene manifest, quality gate és viewer adapter kontroll van.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="V17 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="Worker" value={readiness.worker.status} detail={readiness.worker.mode} />
        <MetricCard label="Scene manifest" value={`${readiness.scenes.manifestCoverage}%`} detail={`${readiness.scenes.manifests.length} manifest`} />
        <MetricCard label="Quality" value={`${readiness.quality.score}%`} detail={readiness.quality.status} />
      </div>
      <Card>
        <h2 className="text-xl font-black">V17 gate-ek</h2>
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
        <h2 className="text-xl font-black">Blokkolók / következő lépések</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {readiness.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}
        </ul>
      </Card>
    </div>
  );
}
