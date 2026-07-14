import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";


export default async function ListingImprovementsPage() {
  const { agency } = await getCurrentUser();
  const recs = await prisma.listingImprovementRecommendation.findMany({ where: { agencyId: agency.id }, orderBy: [{ priority: "desc" }, { createdAt: "desc" }], take: 80 });
  const open = recs.filter((r) => r.status === "open").length;
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">Conversion intelligence</p><h1 className="text-3xl font-black">Listing Improvement Engine</h1><p className="mt-2 text-slate-600">Automatikus javítási javaslatok minden listinghez: média, tour, alaprajz, copy, CTA.</p></div><div className="grid gap-4 md:grid-cols-3"><MetricCard label="Javaslat" value={recs.length} /><MetricCard label="Nyitott" value={open} /><MetricCard label="Top priority" value={recs[0]?.priority ?? 0} /></div><Card><div className="space-y-3">{recs.map((r) => <div key={r.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between"><p className="font-black">{r.title}</p><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{r.priority}</span></div><p className="mt-2 text-sm text-slate-600">{r.rationale}</p><p className="mt-2 text-sm font-semibold text-slate-900">Teendő: {r.suggestedAction}</p><p className="mt-1 text-xs text-slate-400">{r.category} • {r.status}</p></div>)}{!recs.length ? <p className="text-slate-500">Nincs javaslat. POST /api/listing-improvements listingId-val.</p> : null}</div></Card></div>;
}
