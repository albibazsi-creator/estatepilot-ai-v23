import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { syncLaunchRisks } from "@/lib/launch-risks-v14";

export default async function LaunchRisksPage() {
  const { agency } = await getCurrentUser();
  const summary = await syncLaunchRisks(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Risk control</p><h1 className="text-3xl font-black">Launch Risk Register</h1><p className="mt-2 text-slate-600">Itt van minden, ami miatt még nem szabad production ügyfélnek kiadni.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Risk score" value={`${summary.score}%`} detail={summary.status} /><MetricCard label="Open" value={summary.open} /><MetricCard label="Critical" value={summary.critical} /><MetricCard label="High" value={summary.high} /></div>
      <Card><h2 className="text-xl font-black">Rizikók</h2><div className="mt-4 space-y-3">{summary.risks.map((risk) => <div key={risk.key} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><div><h3 className="font-bold">{risk.title}</h3><p className="text-sm text-slate-600">{risk.ownerArea} · {risk.mitigation}</p></div><StatusPill label={`${risk.severity} / ${risk.status}`} tone={risk.status === "mitigated" ? "green" : risk.severity === "critical" ? "red" : "amber"} /></div></div>)}</div></Card>
    </div>
  );
}
