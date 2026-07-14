import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getPremiumDemoFlow } from "@/lib/v21-start-before-launch";

export default function PremiumDemoPage() {
  const demo = getPremiumDemoFlow();
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Premium UX demo</p><h1 className="text-3xl font-black">2 perces Zillow-szerű wow-flow</h1><p className="mt-2 text-slate-600">A start előtti cél: egy mintaingatlanon ne feature-listát mutassunk, hanem látványos ingatlanértékesítési élményt.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Demo score" value={`${demo.score}%`} detail={demo.status} /><MetricCard label="Demo steps" value={demo.demoSequence.length} detail="sales flow" /><MetricCard label="UX principles" value={demo.uxPrinciples.length} detail="demo guardrails" /></div><Card><h2 className="text-xl font-black">Demo sequence</h2><div className="mt-4 space-y-2 text-sm">{demo.demoSequence.map((step) => <div key={step} className="rounded-2xl border bg-white p-3 font-semibold">{step}</div>)}</div></Card><Card><h2 className="text-xl font-black">UX elvek</h2><div className="mt-4 flex flex-wrap gap-2 text-sm">{demo.uxPrinciples.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-2 font-semibold">{item}</span>)}</div></Card></div>;
}
