import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getIntegrationLaunchMatrix } from "@/lib/v21-start-before-launch";

function tone(status: string) { return status === "ready" ? "green" as const : status === "warning" ? "amber" as const : "red" as const; }

export default function IntegrationLaunchPage() {
  const matrix = getIntegrationLaunchMatrix();
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Integration launch</p><h1 className="text-3xl font-black">Start előtti provider kapcsolók</h1><p className="mt-2 text-slate-600">Auth, storage, email, monitoring és AI nélkül nincs éles pilot. Billing/calendar lehet fallback, de csak dokumentáltan.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Integration score" value={`${matrix.score}%`} detail={matrix.status} /><MetricCard label="Providers" value={matrix.providers.length} detail="launch matrix" /><MetricCard label="Required live" value={matrix.providers.filter((p) => p.requiredForStart).length} detail="before pilot" /></div><Card><h2 className="text-xl font-black">Provider matrix</h2><div className="mt-4 grid gap-3 lg:grid-cols-2">{matrix.providers.map((provider) => <div key={provider.key} className="rounded-2xl border bg-white p-4 text-sm"><div className="flex items-center justify-between"><p className="font-black">{provider.label}</p><StatusPill label={`${provider.score}% ${provider.status}`} tone={tone(provider.status)} /></div><p className="mt-2 text-slate-600">Required for start: {provider.requiredForStart ? "igen" : "pilot fallback ok"}</p><p className="mt-1 text-xs text-amber-700">Missing env: {provider.missingEnv.join(", ") || "none"}</p></div>)}</div><p className="mt-4 text-sm font-semibold text-slate-700">{matrix.minimumStartCut}</p></Card></div>;
}
