import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getProviderCertificationGate } from "@/lib/v22-american-grade";

function tone(status: string) {
  if (status === "certified") return "green" as const;
  if (status === "partial") return "amber" as const;
  if (status === "ready") return "green" as const;
  if (status === "warning") return "amber" as const;
  return "red" as const;
}

export default function Page() {
  const data = getProviderCertificationGate();
  const gates = "gates" in data ? data.gates : [data];
  const blockers = "blockers" in data ? data.blockers : [];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V22 American-grade</p>
        <h1 className="text-3xl font-black">Provider certification matrix</h1>
        <p className="mt-2 text-slate-600">Auth, storage, email, billing, calendar és monitoring SLA/smoke/rollback kontrollja.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Score" value={`${data.score}%`} detail={"status" in data ? data.status : "gate"} />
        <MetricCard label="Gates" value={gates.length} detail="quality controls" />
        <MetricCard label="Blockers" value={blockers.length} detail="before paid start" />
        <MetricCard label="Version" value={"version" in data ? data.version : "v22"} detail="american-grade" />
      </div>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Acceptance gates</h2>
          <StatusPill label={"status" in data ? data.status : "partial"} tone={tone("status" in data ? data.status : "partial")} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {gates.map((gate) => (
            <div key={gate.key} className="rounded-2xl border bg-white p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{gate.label}</h3>
                <StatusPill label={`${gate.score}% ${gate.status}`} tone={tone(gate.status)} />
              </div>
              <p className="mt-2 text-slate-600">{gate.target}</p>
              <div className="mt-3">
                <p className="text-xs font-black uppercase text-slate-500">Acceptance criteria</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
                  {gate.acceptanceCriteria.slice(0, 5).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              {gate.blockers.length ? <p className="mt-3 text-xs text-amber-700">Blocker: {gate.blockers.slice(0, 4).join(", ")}{gate.blockers.length > 4 ? "…" : ""}</p> : <p className="mt-3 text-xs text-emerald-700">Nincs strukturális blocker ezen a gate-en.</p>}
            </div>
          ))}
        </div>
      </Card>
      {"americanGradeStartSequence" in data ? (
        <Card>
          <h2 className="text-xl font-black">American-grade start sequence</h2>
          <div className="mt-4 space-y-2 text-sm">
            {data.americanGradeStartSequence.map((step) => <div key={step} className="rounded-2xl border bg-slate-50 p-3 font-semibold">{step}</div>)}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
