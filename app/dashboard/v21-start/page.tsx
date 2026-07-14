import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getV21StartBeforeLaunchReadiness } from "@/lib/v21-start-before-launch";

function tone(status: string) {
  if (status === "ready") return "green" as const;
  if (status === "warning") return "amber" as const;
  return "red" as const;
}

export default function V21StartPage() {
  const readiness = getV21StartBeforeLaunchReadiness();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V21 start-before-launch</p>
        <h1 className="text-3xl font-black">Start előtti 6 amerikai-szintű gap lezárása</h1>
        <p className="mt-2 text-slate-600">Ez a kör a v20 tesztelhető csomagot a start előtti valós hiányokra húzza rá: build, live AI, live 3D, premium UX, CRM automation és integrációs kapcsolók.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="V21 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="Pillars" value={readiness.pillars.length} detail="start gates" />
        <MetricCard label="Blocker groups" value={readiness.blockers.length} detail="configure/fix before start" />
        <MetricCard label="Checksum" value={readiness.checksum.slice(0, 8)} detail="release fingerprint" />
      </div>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">A 6 start előtti pillar</h2>
          <StatusPill label={readiness.status} tone={tone(readiness.status)} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {readiness.pillars.map((pillar) => (
            <div key={pillar.key} className="rounded-2xl border bg-white p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{pillar.title}</h3>
                <StatusPill label={`${pillar.score}% ${pillar.status}`} tone={tone(pillar.status)} />
              </div>
              <p className="mt-2 text-slate-600">{pillar.goal}</p>
              <p className="mt-3 font-semibold">Start gate: {pillar.startGate}</p>
              <p className="mt-1 text-xs text-slate-500">Owner: {pillar.owner}</p>
              {pillar.missing.length ? <p className="mt-2 text-xs text-amber-700">Hiányzó / konfigurálandó: {pillar.missing.slice(0, 5).join(", ")}{pillar.missing.length > 5 ? "…" : ""}</p> : <p className="mt-2 text-xs text-emerald-700">Nincs strukturális hiány a pillarben.</p>}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Final start sequence</h2>
        <div className="mt-4 space-y-2 text-sm">
          {readiness.finalStartSequence.map((step) => <div key={step} className="rounded-2xl border bg-slate-50 p-3 font-semibold">{step}</div>)}
        </div>
      </Card>
    </div>
  );
}
