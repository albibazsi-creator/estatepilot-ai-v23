import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getLiveAiWiringPlan } from "@/lib/v21-start-before-launch";

export default function LiveAiPage() {
  const plan = getLiveAiWiringPlan();
  return (
    <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Live AI wiring</p><h1 className="text-3xl font-black">Valódi OpenAI / vision / guardrail start layer</h1><p className="mt-2 text-slate-600">A cél: mock AI helyett mintaingatlanon bizonyított képelemzés, szöveggenerálás, property chat és döntésnapló.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="AI score" value={`${plan.score}%`} detail={plan.status} /><MetricCard label="Endpoints" value={plan.liveEndpoints.length} detail="AI routes" /><MetricCard label="Missing env" value={plan.missingEnv.length} detail={plan.missingEnv.join(", ") || "none"} /></div><Card><div className="flex items-center justify-between"><h2 className="text-xl font-black">Production rules</h2><StatusPill label={plan.status} tone={plan.status === "ready" ? "green" : plan.status === "warning" ? "amber" : "red"} /></div><ul className="mt-4 space-y-2 text-sm">{plan.productionRules.map((rule) => <li key={rule} className="rounded-2xl border bg-slate-50 p-3">{rule}</li>)}</ul></Card></div>
  );
}
