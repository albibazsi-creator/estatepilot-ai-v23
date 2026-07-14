import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getBuildHardeningPlan } from "@/lib/v21-start-before-launch";

export default function StartHardeningPage() {
  const plan = getBuildHardeningPlan();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Build/runtime hardening</p>
        <h1 className="text-3xl font-black">Start előtti futtathatósági kapu</h1>
        <p className="mt-2 text-slate-600">Itt nem feature készül, hanem azt kényszerítjük ki, hogy a csomag fejlesztői gépen és stagingen is bizonyíthatóan induljon.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Hardening score" value={`${plan.score}%`} detail={plan.status} /><MetricCard label="Required files" value={plan.requiredFiles.length} detail={`${plan.missingFiles.length} missing`} /><MetricCard label="Required scripts" value={plan.requiredScripts.length} detail={`${plan.missingScripts.length} missing`} /></div>
      <Card><div className="flex items-center justify-between"><h2 className="text-xl font-black">Command sequence</h2><StatusPill label={plan.status} tone={plan.status === "ready" ? "green" : plan.status === "warning" ? "amber" : "red"} /></div><div className="mt-4 space-y-2">{plan.commandSequence.map((cmd) => <code key={cmd} className="block rounded-xl bg-slate-950 p-3 text-xs text-white">{cmd}</code>)}</div><p className="mt-4 text-sm font-semibold text-slate-700">{plan.hardRule}</p></Card>
    </div>
  );
}
