import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSpatialQualitySummary } from "@/lib/spatial-v17";

export default async function ThreeDQualityPage() {
  const { agency } = await getCurrentUser();
  const quality = await getSpatialQualitySummary(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D quality gate</p>
        <h1 className="text-3xl font-black">Digital Twin Quality</h1>
        <p className="mt-2 text-slate-600">Geometria, textúra, coverage, viewer és disclosure ellenőrzés a publikálás előtt.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Quality score" value={`${quality.score}%`} detail={quality.status} />
        <MetricCard label="Warnings" value={quality.warnings} detail="quality metric" />
        <MetricCard label="Input readiness" value={`${quality.readiness.score}%`} detail={quality.readiness.status} />
        <MetricCard label="Gates" value={quality.gates.length} detail="publish controls" />
      </div>
      <Card>
        <h2 className="text-xl font-black">Quality gate-ek</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {quality.gates.map((gate) => <div key={gate.key} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><span className="font-black">{gate.label}</span><StatusPill label={gate.status} tone={gate.status === "passed" ? "green" : "amber"} /></div><p className="mt-2 text-sm text-slate-600">Threshold: {gate.threshold}%</p></div>)}
        </div>
      </Card>
    </div>
  );
}
