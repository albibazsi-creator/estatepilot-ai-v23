import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { computeSlaStatus } from "@/lib/sla";

export default async function SlaPage() {
  const { agency } = await getCurrentUser();
  const incidents = await prisma.slaIncident.findMany({ where: { OR: [{ agencyId: agency.id }, { agencyId: null }] }, orderBy: { startedAt: "desc" }, take: 30 });
  const status = computeSlaStatus(incidents);
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black tracking-tight">SLA / rendszerstátusz</h1><p className="mt-1 text-slate-500">AI, upload, billing, email és public listing működési státusz.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Status" value={status.label} detail={status.message} /><MetricCard label="SLA score" value={`${status.score}%`} detail="demo számítás" /><MetricCard label="Nyitott incidens" value={incidents.filter(i => i.status !== 'resolved').length} detail="ops" /></div>
      <Card><h2 className="text-xl font-black">Incidensek</h2><div className="mt-4 space-y-3">{incidents.map((i) => <div key={i.id} className="rounded-2xl border p-4"><div className="flex justify-between"><b>{i.title}</b><span className="text-xs font-bold">{i.service} • {i.severity} • {i.status}</span></div><p className="mt-2 text-sm text-slate-500">{i.description}</p></div>)}</div></Card>
    </div>
  );
}
