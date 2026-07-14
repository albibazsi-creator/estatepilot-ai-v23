import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { getCurrentUser } from "@/lib/current-user";
import { getPilotOnboardingSummary } from "@/lib/pilot-onboarding";

export default async function PilotOnboardingPage() {
  const { agency } = await getCurrentUser();
  const summary = await getPilotOnboardingSummary(agency.id);
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Pilot success</p><h1 className="text-3xl font-black">Pilot Onboarding</h1><p className="mt-2 text-slate-600">7 napos pilot checklist, hogy az első ingatlanos ügyféllel mérhető eredményt lehessen mutatni.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><MetricCard label="Pilot score" value={`${summary.score}%`} detail={summary.status} /><MetricCard label="Milestone" value={summary.total} /><MetricCard label="Kész" value={summary.done} /><MetricCard label="Overdue" value={summary.overdue} /></div>
      <Card><h2 className="text-xl font-black">Milestone-ok</h2><div className="mt-4 space-y-3">{summary.items.map((item) => <div key={item.key} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><b>{item.title}</b><StatusPill label={item.status} tone={item.status === "done" ? "green" : item.status === "blocked" ? "red" : "amber"} /></div><p className="mt-1 text-xs text-slate-500">Owner: {item.ownerEmail ?? "nincs"} · due: {item.dueAt ? item.dueAt.toLocaleDateString("hu-HU") : "nincs"}</p></div>)}</div></Card>
    </div>
  );
}
