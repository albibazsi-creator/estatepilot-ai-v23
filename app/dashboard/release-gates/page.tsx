import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getLatestReleaseGateSummary } from "@/lib/release-gates-v13";

export default async function ReleaseGatesPage() {
  const { agency } = await getCurrentUser();
  const summary = await getLatestReleaseGateSummary(agency.id);
  const checks = (summary.latest?.checksJson as any[]) ?? [];
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Release operations</p><h1 className="text-3xl font-black">V13 Release Gates</h1><p className="mt-2 text-slate-600">Pilot kiadás előtti automata kapuk: contract, taxonomy, metering, onboarding és v12 readiness.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Gate score" value={`${summary.score}%`} detail={summary.status} /><MetricCard label="Utolsó futás" value={summary.latest ? summary.latest.createdAt.toLocaleDateString("hu-HU") : "nincs"} /><MetricCard label="Gate" value={summary.latest?.gateKey ?? "v13_pilot_release"} /></div>
      <Card><h2 className="text-xl font-black">Checkek</h2>{checks.length ? <div className="mt-4 space-y-3">{checks.map((check: any) => <div key={check.key} className="flex items-center justify-between rounded-2xl border p-4"><div><b>{check.label}</b><p className="text-xs text-slate-500">{check.detail}</p></div><StatusPill label={check.ok ? "pass" : "fail"} tone={check.ok ? "green" : "red"} /></div>)}</div> : <p className="mt-3 text-sm text-slate-600">Még nincs release gate futás. API: <code className="rounded bg-slate-100 px-2 py-1">POST /api/release-gates/run</code></p>}</Card>
    </div>
  );
}
