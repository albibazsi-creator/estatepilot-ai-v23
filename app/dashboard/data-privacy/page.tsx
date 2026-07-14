import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function DataPrivacyPage() {
  const { agency } = await getCurrentUser();
  const requests = await prisma.dataSubjectRequest.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const open = requests.filter((r) => !["completed", "closed"].includes(r.status)).length;
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Privacy ops</p><h1 className="text-3xl font-black">GDPR / DSR központ</h1><p className="mt-2 text-slate-600">Adatlekérési, törlési és helyesbítési kérelmek kezelése auditálható módon.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="DSR kérelmek" value={requests.length} /><MetricCard label="Nyitott" value={open} /><MetricCard label="SLA" value="30 nap" detail="GDPR operációs cél" /></div><Card><div className="divide-y">{requests.map((r) => <div key={r.id} className="py-4"><div className="flex items-center justify-between"><div><p className="font-black">{r.requesterEmail}</p><p className="text-sm text-slate-500">{r.requestType} • {r.scope}</p></div><StatusPill label={r.status} tone={r.status === "completed" ? "green" : "amber"} /></div><p className="mt-2 text-xs text-slate-400">Due: {r.dueAt?.toLocaleDateString("hu-HU") ?? "n/a"}</p></div>)}{!requests.length ? <p className="text-slate-500">Nincs DSR kérelem.</p> : null}</div></Card></div>;
}
