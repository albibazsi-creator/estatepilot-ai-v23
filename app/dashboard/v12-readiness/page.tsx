import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getV12Readiness } from "@/lib/v12-readiness";
import { RunAcceptanceButton, RunProviderCheckButton } from "@/components/dashboard/v12-actions";

export default async function V12ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV12Readiness(agency.id);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V12 go-live command center</p>
          <h1 className="text-3xl font-black">V12 Go-Live Readiness</h1>
          <p className="mt-2 text-slate-600">Provider health, acceptance teszt, domain, secret rotation, deployment és SLO egy helyen.</p>
        </div>
        <div className="flex gap-2"><RunProviderCheckButton /><RunAcceptanceButton /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <MetricCard label="V12 score" value={`${readiness.score}%`} detail={readiness.status} />
        <MetricCard label="V11 alap" value={`${readiness.v11.score}%`} detail={readiness.v11.status} />
        <MetricCard label="Providerek" value={`${readiness.providers.score}%`} detail={`${readiness.providers.ready}/${readiness.providers.total} ready`} />
        <MetricCard label="Deploy" value={`${readiness.deployment.score}%`} detail={`${readiness.deployment.ready} ready`} />
        <MetricCard label="Domain" value={`${readiness.domains.score}%`} detail={readiness.domains.status} />
        <MetricCard label="Secrets" value={`${readiness.secrets.score}%`} detail={`${readiness.secrets.configured}/${readiness.secrets.total}`} />
        <MetricCard label="SLO" value={`${readiness.slos.score}%`} detail={`${readiness.slos.met} met`} />
      </div>
      <Card>
        <h2 className="text-xl font-black">Go-live blockerek</h2>
        {readiness.blockers.length ? <ul className="mt-4 space-y-2">{readiness.blockers.map((b) => <li key={b} className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{b}</li>)}</ul> : <p className="mt-3 text-sm text-emerald-700">Nincs kritikus go-live blocker.</p>}
      </Card>
      <Card>
        <h2 className="text-xl font-black">Provider snapshot</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {readiness.providers.checks.map((check: any) => <div key={`${check.provider}-${check.area}`} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><b>{check.provider}</b><StatusPill label={check.status} tone={check.status === "ready" ? "green" : check.status === "partial" ? "amber" : "red"} /></div><p className="mt-2 text-sm text-slate-500">{check.area} · {check.mode}</p></div>)}
        </div>
      </Card>
    </div>
  );
}
