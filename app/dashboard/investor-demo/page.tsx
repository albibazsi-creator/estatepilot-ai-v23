import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { getInvestorDemoPack } from "@/lib/investor-demo";

export default async function InvestorDemoPage() {
  const { agency } = await getCurrentUser();
  const pack = await getInvestorDemoPack(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 investor demo</p><h1 className="text-3xl font-black">Investor / Enterprise Demo Pack</h1><p className="mt-2 text-slate-600">Egyben mutatható traction, product coverage, enterprise readiness és sales playbook.</p></div><div className="grid gap-4 md:grid-cols-4">{pack.metrics.map((m) => <MetricCard key={m.id} label={m.label} value={m.value} detail={m.category} />)}</div><Card><h2 className="text-xl font-black">Sales playbook</h2><div className="mt-4 space-y-3">{pack.playbook.map((step) => <div key={step.id} className="rounded-2xl border p-4"><p className="font-black">{step.sortOrder}. {step.title}</p><p className="mt-2 text-sm text-slate-600">{step.script}</p>{step.objection ? <p className="mt-2 text-xs font-bold text-slate-500">Objection: {step.objection}</p> : null}{step.answer ? <p className="mt-1 text-xs text-slate-600">Válasz: {step.answer}</p> : null}</div>)}</div></Card></div>;
}
