import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function AiEvalsPage() {
  const { agency } = await getCurrentUser();
  const runs = await prisma.aiEvaluationRun.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 20 });
  const cases = await prisma.aiEvaluationCase.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const latest = runs[0];
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">AI safety</p><h1 className="text-3xl font-black">AI Evaluation Suite</h1><p className="mt-2 text-slate-600">Property chat és AI guardrail regression tesztek, hogy ne állítson nem bizonyított adatot.</p></div><div className="grid gap-4 md:grid-cols-4"><MetricCard label="Eval run" value={runs.length} /><MetricCard label="Latest score" value={latest?.score ?? 0} /><MetricCard label="Passed" value={latest?.passed ?? 0} /><MetricCard label="Warnings" value={latest?.warnings ?? 0} /></div><Card><div className="space-y-3">{cases.map((c) => <div key={c.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{c.caseKey}</p><StatusPill label={c.result} tone={c.result === "passed" ? "green" : c.result === "failed" ? "red" : "amber"} /></div><p className="mt-2 text-sm text-slate-600">Prompt: {c.prompt}</p><p className="mt-1 text-xs text-slate-500">Expected: {c.expectedBehavior}</p></div>)}{!cases.length ? <p className="text-slate-500">Nincs eval case.</p> : null}</div></Card></div>;
}
