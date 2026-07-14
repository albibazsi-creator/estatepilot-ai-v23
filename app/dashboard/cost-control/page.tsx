import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { getCostControlSummary } from "@/lib/cost-control";

export default async function CostControlPage() {
  const { agency } = await getCurrentUser();
  const data = await getCostControlSummary(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 AI cost control</p><h1 className="text-3xl font-black">AI költségkontroll</h1><p className="mt-2 text-slate-600">AI token/költség budget, feature szintű usage és hard limit előkészítés.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Budget status" value={data.status.state} detail={`${data.status.percent}% felhasználva`} /><MetricCard label="Monthly limit" value={`${data.budget.monthlyLimit.toLocaleString("hu-HU")} Ft`} detail={data.budget.periodLabel} /><MetricCard label="Spend" value={`${data.budget.currentSpend.toLocaleString("hu-HU")} Ft`} detail="becsült" /><MetricCard label="Remaining" value={`${data.status.remainingHuf.toLocaleString("hu-HU")} Ft`} detail="havi keretből" /></div>
      <Card><div className="space-y-3">{data.usage.length === 0 ? <p className="text-sm text-slate-500">Még nincs usage event.</p> : data.usage.map((u) => <div key={u.feature} className="flex items-center justify-between rounded-2xl border p-4"><div><p className="font-black">{u.feature}</p><p className="text-sm text-slate-500">input {u._sum.inputTokens ?? 0} • output {u._sum.outputTokens ?? 0}</p></div><p className="font-black">{(u._sum.estimatedCostHuf ?? 0).toLocaleString("hu-HU")} Ft</p></div>)}</div></Card>
    </div>
  );
}
