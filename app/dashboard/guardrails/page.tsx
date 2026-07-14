import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";

export default async function GuardrailsPage() {
  const { agency } = await getCurrentUser();
  const [rules, events] = await Promise.all([
    prisma.chatGuardrailRule.findMany({ where: { OR: [{ agencyId: agency.id }, { agencyId: null }] }, orderBy: { severity: "desc" } }),
    prisma.chatGuardrailEvent.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black tracking-tight">AI chat guardrails</h1><p className="mt-1 text-slate-500">Hallucináció, megtévesztő állítás és nem igazolt extra blokkolása.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Szabály" value={rules.length} detail="aktív/minta" /><MetricCard label="Guardrail event" value={events.length} detail="naplózott safe reply" /><MetricCard label="Compliance fókusz" value="AI staging" detail="disclosure first" /></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><h2 className="text-xl font-black">Szabályok</h2><div className="mt-4 space-y-3">{rules.map((r) => <div key={r.id} className="rounded-2xl border p-4"><div className="font-bold">{r.title}</div><p className="text-xs text-slate-500">{r.key} • {r.severity} • {r.enabled ? 'enabled' : 'off'}</p><p className="mt-2 text-sm">{r.safeReply}</p></div>)}</div></Card>
        <Card><h2 className="text-xl font-black">Legutóbbi események</h2><div className="mt-4 space-y-3">{events.map((e) => <div key={e.id} className="rounded-2xl border p-4"><b>{e.ruleKey}</b><p className="mt-1 text-sm text-slate-500">{e.userMessage}</p><p className="mt-2 text-sm">{e.safeReply}</p></div>)}</div></Card>
      </div>
    </div>
  );
}
