import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV14Readiness } from "@/lib/v14-readiness";

export default async function V14ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV14Readiness(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V14 production pilot command</p>
        <h1 className="text-3xl font-black">V14 Highest-Level Readiness</h1>
        <p className="mt-2 text-slate-600">A fókusz most a futó, eladható pilot flow: listing → AI → landing → lead → scoring → seller report → sales follow-up.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <MetricCard label="V14 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="Core flow" value={`${readiness.core.score}%`} detail={`${readiness.core.failed} failed`} />
        <MetricCard label="Provider adapter" value={`${readiness.adapters.score}%`} detail={`${readiness.adapters.live} live / ${readiness.adapters.mock} mock`} />
        <MetricCard label="E2E" value={`${readiness.e2e.score}%`} detail="scenario coverage" />
        <MetricCard label="Launch risk" value={`${readiness.risks.score}%`} detail={readiness.risks.status} />
      </div>
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Legfontosabb blockerek</h2>
          <StatusPill label={readiness.status} tone={readiness.status === "pilot_ready" ? "green" : readiness.status === "near_pilot" ? "amber" : "red"} />
        </div>
        {readiness.blockers.length ? (
          <ul className="mt-4 space-y-2">
            {readiness.blockers.map((blocker) => <li key={blocker} className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-800">{blocker}</li>)}
          </ul>
        ) : <p className="mt-3 text-sm font-semibold text-emerald-700">Nincs kritikus blocker. Mehet a pilot acceptance run.</p>}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Core pilot flow</h2>
          <div className="mt-4 space-y-3">
            {readiness.core.checks.map((check) => <div key={check.key} className="rounded-2xl border p-3 text-sm"><div className="flex items-center justify-between"><span className="font-bold">{check.label}</span><StatusPill label={check.status} tone={check.status === "passed" ? "green" : check.status === "warning" ? "amber" : "red"} /></div><p className="mt-1 text-slate-600">{check.evidence}</p></div>)}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Provider adapter állapot</h2>
          <div className="mt-4 space-y-3">
            {readiness.adapters.adapters.map((adapter) => <div key={adapter.adapterKey} className="rounded-2xl border p-3 text-sm"><div className="flex items-center justify-between"><span className="font-bold">{adapter.adapterKey}</span><StatusPill label={adapter.status} tone={adapter.status === "live" ? "green" : adapter.status === "partial" ? "amber" : "red"} /></div><p className="mt-1 text-slate-600">{adapter.notes}</p></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
