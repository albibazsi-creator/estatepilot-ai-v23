import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getLiveCrmAutomationPlan } from "@/lib/v21-start-before-launch";

export default function LiveCrmPage() {
  const crm = getLiveCrmAutomationPlan();
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">CRM sales automation</p><h1 className="text-3xl font-black">Leadből automata értékesítési folyamat</h1><p className="mt-2 text-slate-600">Amerikai szinten nem elég leadet gyűjteni: score, next best action, follow-up task és seller activity kell belőle.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="CRM score" value={`${crm.score}%`} detail={crm.status} /><MetricCard label="Loop steps" value={crm.automationLoop.length} detail="lead → deal" /><MetricCard label="Rules" value={crm.startRules.length} detail="start scoring" /></div><Card><h2 className="text-xl font-black">Automation loop</h2><div className="mt-4 space-y-2 text-sm">{crm.automationLoop.map((step) => <div key={step} className="rounded-2xl border bg-slate-50 p-3 font-semibold">{step}</div>)}</div></Card><Card><h2 className="text-xl font-black">Start scoring szabályok</h2><ul className="mt-4 space-y-2 text-sm">{crm.startRules.map((rule) => <li key={rule} className="rounded-2xl border p-3">{rule}</li>)}</ul></Card></div>;
}
