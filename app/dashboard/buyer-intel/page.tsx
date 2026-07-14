import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";

export default async function BuyerIntelPage() {
  const { agency } = await getCurrentUser();
  const [personas, scores] = await Promise.all([
    prisma.buyerPersona.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" } }),
    prisma.buyerMatchScore.findMany({ where: { agencyId: agency.id }, orderBy: { score: "desc" }, take: 20 })
  ]);
  const excellent = scores.filter((s) => s.score >= 80).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Buyer intelligence</h1>
        <p className="mt-1 text-slate-500">Persona alapú vevő-illeszkedés, lead ajánlás és next best action.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Buyer persona" value={personas.length} detail="aktív profil" />
        <MetricCard label="Match score" value={scores.length} detail="számolt illeszkedés" />
        <MetricCard label="Excellent fit" value={excellent} detail="80+ pont" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card><h2 className="text-xl font-black">Personák</h2><div className="mt-4 space-y-3">{personas.map((p) => <div key={p.id} className="rounded-2xl border p-4"><div className="font-bold">{p.name}</div><p className="text-sm text-slate-500">{p.description}</p><p className="mt-2 text-xs font-bold">{p.intent} • {p.budgetMin ?? '-'}–{p.budgetMax ?? '-' } Ft</p></div>)}</div></Card>
        <Card><h2 className="text-xl font-black">Legjobb illeszkedések</h2><div className="mt-4 space-y-3">{scores.map((s) => <div key={s.id} className="rounded-2xl border p-4"><div className="flex justify-between"><b>{s.fitLabel}</b><span>{s.score}/100</span></div><p className="mt-2 text-sm text-slate-500">{s.nextAction}</p></div>)}</div></Card>
      </div>
    </div>
  );
}
