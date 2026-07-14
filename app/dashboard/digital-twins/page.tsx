import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getDigitalTwinReadiness } from "@/lib/spatial-3d";

export default async function DigitalTwinsPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getDigitalTwinReadiness(agency.id);
  const inputCoverage = Math.round(readiness.checks.slice(1, 5).reduce((sum, check) => sum + check.score, 0) / 4);
  const geometryCoverage = Math.round(readiness.checks.slice(4, 7).reduce((sum, check) => sum + check.score, 0) / 3);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Digital twin layer</p>
        <h1 className="text-3xl font-black">Digital Twin Audit</h1>
        <p className="mt-2 text-slate-600">Ez mutatja, mennyire áll készen egy ingatlan a Matterport-szerű / 360 / Gaussian Splatting digitális iker élményre.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Readiness" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="Input coverage" value={`${inputCoverage}%`} detail="fotó/videó/360" />
        <MetricCard label="Geometry" value={`${geometryCoverage}%`} detail="room graph + alaprajz" />
        <MetricCard label="Blockers" value={readiness.blockers.length} detail="3D audit" />
      </div>
      <Card>
        <h2 className="text-xl font-black">Audit checkek</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {readiness.checks.map((check) => (
            <div key={check.key} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between"><h3 className="font-black">{check.label}</h3><StatusPill label={check.status} tone={check.status === "passed" ? "green" : check.status === "warning" ? "amber" : "red"} /></div>
              <p className="mt-2 text-sm text-slate-600">{check.evidence}</p>
              {check.status !== "passed" ? <p className="mt-2 text-sm font-semibold text-slate-900">Következő lépés: {check.nextAction}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
