import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { groupPipeline } from "@/lib/deal-pipeline";
import { formatPrice } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";

export default async function DealsPage() {
  const { agency } = await getCurrentUser();
  const deals = await prisma.dealPipelineItem.findMany({ where: { agencyId: agency.id }, orderBy: [{ probability: "desc" }, { updatedAt: "desc" }] });
  const summary = groupPipeline(deals);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-black">Deal Pipeline</h1><p className="mt-1 text-slate-500">Leadből üzleti pipeline: stage, valószínűség, forecast jutalékérték.</p></div>
        <Button href="/api/deals?sync=1" variant="secondary">Leadek szinkronizálása</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {summary.filter(s => s.count > 0).map((s) => <Card key={s.stage} className="p-4"><div className="text-xs font-bold uppercase text-slate-500">{s.stage}</div><div className="mt-2 text-2xl font-black">{s.count}</div><div className="text-sm text-slate-500">{formatPrice(s.forecastValue)} forecast</div></Card>)}
      </div>
      <Card>
        <h2 className="text-xl font-black">Pipeline tételek</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {deals.map((deal) => <div key={deal.id} className="grid gap-3 py-4 md:grid-cols-[1fr_140px_160px_120px]"><div><div className="font-bold">{deal.title}</div><div className="text-sm text-slate-500">{deal.nextStep}</div></div><StatusPill label={deal.stage} tone="blue" /><div className="font-bold">{formatPrice(deal.forecastValue)}</div><div className="text-sm font-black">{deal.probability}%</div></div>)}
          {deals.length === 0 ? <p className="text-sm text-slate-500">Nincs még deal. Nyisd meg az API-t sync=1 paraméterrel.</p> : null}
        </div>
      </Card>
    </div>
  );
}
