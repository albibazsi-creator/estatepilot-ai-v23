import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getLaunchReadiness } from "@/lib/launch-readiness";

export default async function LaunchPage() {
  const { agency } = await getCurrentUser();
  const data = await getLaunchReadiness(agency.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 launch ops</p>
        <h1 className="text-3xl font-black">Launch Checklist</h1>
        <p className="mt-2 text-slate-600">Éles demo / pilot előtti kritikus teendők súlyozott pontozással.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Launch score" value={`${data.summary.score}%`} detail={`${data.summary.done}/${data.summary.total} kész`} />
        <MetricCard label="Critical blockers" value={data.summary.blockers} detail="élesítés előtt" />
        <MetricCard label="Checklist items" value={data.items.length} detail="security, AI, storage, legal, sales" />
      </div>
      <Card><div className="space-y-3">{data.items.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-black">{item.title}</p><p className="text-sm text-slate-500">{item.area} • {item.severity}</p></div><StatusPill status={item.status} /></div>{item.notes ? <p className="mt-2 text-sm text-slate-600">{item.notes}</p> : null}</div>)}</div></Card>
    </div>
  );
}
