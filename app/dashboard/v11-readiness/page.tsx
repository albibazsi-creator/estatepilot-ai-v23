import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { getV11Readiness } from "@/lib/v11-readiness";

export default async function V11ReadinessPage() {
  const { agency } = await getCurrentUser();
  const readiness = await getV11Readiness(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 release readiness</p><h1 className="text-3xl font-black">V11 Readiness Center</h1><p className="mt-2 text-slate-600">Launch, cost, tenant boundary, monitoring és retention egyetlen score-ban.</p></div><div className="grid gap-4 md:grid-cols-5"><MetricCard label="Readiness" value={`${readiness.score}%`} detail={readiness.status} /><MetricCard label="Blockers" value={readiness.blockers.length} detail="critical" /><MetricCard label="Launch" value={`${readiness.launch.score}%`} detail={`${readiness.launch.done}/${readiness.launch.total}`} /><MetricCard label="Cost" value={readiness.cost.status.state} detail={`${readiness.cost.status.percent}%`} /><MetricCard label="Monitoring" value={readiness.monitoring.status} detail={`${readiness.monitoring.total} probe`} /></div><Card><h2 className="text-xl font-black">Blockerek</h2>{readiness.blockers.length ? <ul className="mt-4 space-y-2">{readiness.blockers.map((b) => <li key={b} className="rounded-2xl border p-3 text-sm font-semibold text-rose-700">{b}</li>)}</ul> : <p className="mt-3 text-sm text-emerald-700">Nincs kritikus blocker.</p>}</Card></div>;
}
