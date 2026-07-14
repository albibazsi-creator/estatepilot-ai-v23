import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function CustomerSuccessPage() {
  const { agency } = await getCurrentUser();
  const latest = await prisma.customerSuccessHealth.findFirst({ where: { agencyId: agency.id }, orderBy: { calculatedAt: "desc" } });
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">SaaS growth</p><h1 className="text-3xl font-black">Customer Success Health</h1><p className="mt-2 text-slate-600">Ügynökség aktiváció, kockázat, expansion jel és következő lépés.</p></div><form action="/api/customer-success/health" method="post"><Button>Health újraszámítás</Button></form></div><div className="grid gap-4 md:grid-cols-4"><MetricCard label="Health score" value={latest?.healthScore ?? 0} /><MetricCard label="Lifecycle" value={latest?.lifecycleStage ?? "n/a"} /><MetricCard label="Aktív listing" value={latest?.activeListings ?? 0} /><MetricCard label="Forró lead 30d" value={latest?.hotLeadCount30d ?? 0} /></div><Card><h2 className="text-xl font-black">Next action</h2><p className="mt-3 text-slate-700">{latest?.nextAction ?? "Futtasd a health kalkulációt."}</p><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-red-50 p-4"><p className="font-bold text-red-800">Risk signals</p><pre className="mt-2 whitespace-pre-wrap text-sm text-red-700">{JSON.stringify(latest?.riskSignalsJson ?? [], null, 2)}</pre></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="font-bold text-emerald-800">Expansion signals</p><pre className="mt-2 whitespace-pre-wrap text-sm text-emerald-700">{JSON.stringify(latest?.expansionSignalsJson ?? [], null, 2)}</pre></div></div></Card></div>;
}
