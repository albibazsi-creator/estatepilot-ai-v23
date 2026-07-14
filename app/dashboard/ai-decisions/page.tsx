import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function AiDecisionsPage() {
  const { agency } = await getCurrentUser();
  const decisions = await prisma.aiDecisionLog.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 40 });
  const highRisk = decisions.filter((d) => ["high", "critical"].includes(d.riskLevel)).length;
  const avgConfidence = decisions.length ? Math.round(decisions.reduce((s, d) => s + d.confidence, 0) / decisions.length) : 0;
  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">V10 governance</p><h1 className="text-3xl font-black">AI Decision Ledger</h1><p className="mt-2 text-slate-600">Auditálható AI döntések: lead scoring, listing copy, chat guardrail, seller report és ajánlások.</p></div><Button href="/dashboard/ops" variant="secondary">Ops</Button></div>
    <div className="grid gap-4 md:grid-cols-3"><MetricCard label="AI döntés" value={decisions.length} detail="legutóbbi 40" /><MetricCard label="Magas kockázat" value={highRisk} detail="jóváhagyást igényelhet" /><MetricCard label="Átlag confidence" value={`${avgConfidence}%`} detail="mock/external model" /></div>
    <Card><div className="space-y-3">{decisions.map((d) => <div key={d.id} className="rounded-2xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">{d.decisionType}</p><StatusPill label={d.riskLevel} tone={d.riskLevel === "high" || d.riskLevel === "critical" ? "red" : d.riskLevel === "medium" ? "amber" : "green"} /></div><p className="mt-2 text-sm text-slate-600">{d.explanation}</p><p className="mt-2 text-xs text-slate-400">Confidence: {d.confidence}% • Input hash: {d.inputHash ?? "n/a"}</p></div>)}{!decisions.length ? <p className="text-slate-500">Nincs még AI decision log. Seed vagy POST /api/ai/decisions.</p> : null}</div></Card>
  </div>;
}
