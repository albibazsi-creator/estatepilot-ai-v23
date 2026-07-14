import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getSpatialAcceptancePack } from "@/lib/spatial-v18";

export default async function ThreeDAcceptancePage() {
  const { agency } = await getCurrentUser();
  const pack = await getSpatialAcceptancePack(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">3D pilot acceptance</p>
        <h1 className="text-3xl font-black">Digital Twin Acceptance Pack</h1>
        <p className="mt-2 text-slate-600">Ez dönti el, hogy egy 3D/digital twin pilot ügyfélnek bemutatható-e vagy még review/blokkoló van.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Acceptance score" value={`${pack.score}%`} detail={pack.status} />
        <MetricCard label="Gate-ek" value={pack.gates.length} detail="acceptance criteria" />
        <MetricCard label="Blocker" value={pack.blockers.length} detail="kritikus pont" />
      </div>
      <Card>
        <div className="space-y-3">
          {pack.gates.map((gate) => (
            <div key={gate.key} className="rounded-2xl border p-4 text-sm">
              <div className="flex items-center justify-between"><span className="font-black">{gate.label}</span><StatusPill label={gate.status} tone={gate.status === "passed" ? "green" : gate.status === "warning" ? "amber" : "red"} /></div>
              <p className="mt-1 text-slate-600">{gate.evidence}</p>
              <p className="mt-1 font-semibold">Score: {gate.score}%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
