import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { RunAcceptanceButton } from "@/components/dashboard/v12-actions";
import { getCurrentUser } from "@/lib/current-user";
import { getAcceptanceSummary } from "@/lib/acceptance-tests";

export default async function AcceptancePage() {
  const { agency } = await getCurrentUser();
  const summary = await getAcceptanceSummary(agency.id);
  const steps = (summary.lastRun?.stepsJson as any[] | undefined) ?? [];
  return <div className="space-y-6"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Go-live validation</p><h1 className="text-3xl font-black">Acceptance Test Center</h1><p className="mt-2 text-slate-600">Végigellenőrzi, hogy a demo/pilot flow tényleg bemutatható-e.</p></div><RunAcceptanceButton /></div><div className="grid gap-4 md:grid-cols-4"><MetricCard label="Score" value={summary.lastRun ? `${summary.lastRun.score}%` : "—"} detail={summary.lastRun?.status ?? "még nem futott"} /><MetricCard label="Passed" value={summary.lastRun?.passed ?? 0} detail="lépés" /><MetricCard label="Warnings" value={summary.lastRun?.warnings ?? 0} detail="figyelmeztetés" /><MetricCard label="Failed" value={summary.lastRun?.failed ?? 0} detail="hiba" /></div><Card><h2 className="text-xl font-black">Utolsó acceptance lépések</h2>{steps.length ? <div className="mt-4 space-y-3">{steps.map((s) => <div key={s.key} className="rounded-2xl border p-4"><b>{s.title}</b><p className="mt-1 text-sm text-slate-500">{s.status} · {s.evidence}</p>{s.status !== "passed" ? <p className="mt-2 text-sm text-amber-700">{s.remediation}</p> : null}</div>)}</div> : <p className="mt-3 text-sm text-slate-500">Még nem futott acceptance teszt.</p>}</Card></div>;
}
