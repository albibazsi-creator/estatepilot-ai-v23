import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV13Readiness } from "@/lib/v13-readiness";

export default async function V13ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV13Readiness(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V13 pilot command center</p>
        <h1 className="text-3xl font-black">V13 Pilot Readiness</h1>
        <p className="mt-2 text-slate-600">API contract, error taxonomy, usage metering, pilot onboarding és release gate egy dashboardon.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="V13 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="V12 alap" value={`${readiness.v12.score}%`} detail={readiness.v12.status} />
        <MetricCard label="API contract" value={`${readiness.contract.coverage}%`} detail={readiness.contract.status} />
        <MetricCard label="Hibakódok" value={readiness.errors.total} detail={`${readiness.errors.high} high severity`} />
        <MetricCard label="Metering" value={readiness.metering.billableEvents} detail={`${readiness.metering.totalCostHuf} Ft becslés`} />
        <MetricCard label="Pilot" value={`${readiness.pilot.score}%`} detail={readiness.pilot.status} />
      </div>
      <Card>
        <h2 className="text-xl font-black">Pilot blockerek</h2>
        {readiness.blockers.length ? (
          <ul className="mt-4 space-y-2">{readiness.blockers.map((b) => <li key={b} className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{b}</li>)}</ul>
        ) : <p className="mt-3 text-sm font-semibold text-emerald-700">Nincs kritikus v13 pilot blocker.</p>}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between"><h2 className="text-xl font-black">Release gate</h2><StatusPill label={readiness.releaseGate.status} tone={readiness.releaseGate.status === "passed" ? "green" : readiness.releaseGate.status === "warning" ? "amber" : "red"} /></div>
          <p className="mt-2 text-sm text-slate-600">Utolsó v13 gate score: {readiness.releaseGate.score}%</p>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Top usage költségek</h2>
          <div className="mt-4 space-y-3">{readiness.metering.features.slice(0, 5).map((f) => <div key={f.featureKey} className="flex items-center justify-between rounded-2xl border p-3 text-sm"><span className="font-semibold">{f.featureKey}</span><span>{f.quantity} {f.unit} · {f.estimatedCostHuf} Ft</span></div>)}</div>
        </Card>
      </div>
    </div>
  );
}
