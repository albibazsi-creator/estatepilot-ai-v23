import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getCurrentUser } from "@/lib/current-user";
import { createSandboxResetPlan } from "@/lib/sandbox";

export default async function SandboxPage() {
  const { agency } = await getCurrentUser();
  const plan = await createSandboxResetPlan(agency.id);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V11 demo sandbox</p><h1 className="text-3xl font-black">Demo Sandbox Reset Plan</h1><p className="mt-2 text-slate-600">Sales demo előtti visszaállítható snapshot, reset terv és biztonsági tiltás.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Snapshot" value={plan.snapshot.status} detail={plan.snapshot.name} /><MetricCard label="Reset enabled" value={plan.resetEnabled ? "yes" : "no"} detail="env controlled" /><MetricCard label="Steps" value={plan.steps.length} detail="reset runbook" /></div><Card><ol className="space-y-3">{plan.steps.map((step, idx) => <li key={step} className="rounded-2xl border p-4"><p className="font-black">{idx + 1}. {step}</p></li>)}</ol><p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">{plan.warning}</p></Card></div>;
}
