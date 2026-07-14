import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getCorePilotStatus } from "@/lib/core-pilot-flow";

export default async function CoreFlowPage() {
  const { agency } = await getCurrentUser();
  const core = await getCorePilotStatus(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Production core flow</p><h1 className="text-3xl font-black">Core Pilot Flow</h1><p className="mt-2 text-slate-600">Ez mutatja, hogy a valóban eladható MVP útvonal végigmegy-e.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Score" value={`${core.score}%`} detail={core.status} /><MetricCard label="Passed" value={core.passed} /><MetricCard label="Warning" value={core.warnings} /><MetricCard label="Failed" value={core.failed} /></div>
      <Card><h2 className="text-xl font-black">Flow ellenőrzések</h2><div className="mt-4 space-y-3">{core.checks.map((check) => <div key={check.key} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><div><h3 className="font-bold">{check.label}</h3><p className="mt-1 text-sm text-slate-600">{check.evidence}</p></div><StatusPill label={`${check.status} · ${check.score}%`} tone={check.status === "passed" ? "green" : check.status === "warning" ? "amber" : "red"} /></div>{check.nextAction ? <p className="mt-2 text-xs font-semibold text-slate-500">Következő lépés: {check.nextAction}</p> : null}</div>)}</div></Card>
    </div>
  );
}
