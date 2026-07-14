import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";

export default async function SupportPage() {
  const { agency } = await getCurrentUser();
  const tickets = await prisma.supportTicket.findMany({ where: { agencyId: agency.id }, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 50 });
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black tracking-tight">Support desk</h1><p className="mt-1 text-slate-500">Ügyfél és belső support ticketek, kategóriák és resolution log.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Ticket" value={tickets.length} detail="összes" /><MetricCard label="Nyitott" value={tickets.filter(t => t.status === 'open').length} detail="válaszra vár" /><MetricCard label="High priority" value={tickets.filter(t => t.priority === 'high').length} detail="kiemelt" /></div>
      <Card><h2 className="text-xl font-black">Ticketek</h2><div className="mt-4 space-y-3">{tickets.map((t) => <div key={t.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><b>{t.subject}</b><span className="text-xs font-bold">{t.status} • {t.priority}</span></div><p className="mt-2 text-sm text-slate-500">{t.body}</p></div>)}</div></Card>
    </div>
  );
}
