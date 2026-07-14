import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { MetricCard } from "@/components/metric-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { StatusPill } from "@/components/status-pill";

export default async function DashboardPage() {
  const { user, agency } = await getCurrentUser();
  const [listings, leads, events] = await Promise.all([
    prisma.listing.findMany({ where: { agencyId: agency.id }, include: { leads: true, media: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.lead.findMany({ where: { agentId: user.id }, include: { listing: true }, orderBy: { leadScore: "desc" }, take: 5 }),
    prisma.leadEvent.count({ where: { listing: { agencyId: agency.id } } })
  ]);

  const hotLeads = leads.filter((l) => l.leadScore >= 81).length;
  const published = listings.filter((l) => l.isPublished).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="mt-1 text-slate-500">Mai AI manager áttekintés: listingek, leadek, aktivitás.</p>
        </div>
        <Button href="/dashboard/listings/new">Új ingatlan</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Aktív listing" value={listings.length} detail={`${published} publikálva`} />
        <MetricCard label="Lead" value={leads.length} detail={`${hotLeads} forró lead`} />
        <MetricCard label="Esemény" value={events} detail="page/tour/gallery/chat" />
        <MetricCard label="Demo bevételi potenciál" value="29 900 Ft" detail="bevezető / ingatlan" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Legutóbbi ingatlanok</h2>
            <Button href="/dashboard/listings" variant="secondary" size="sm">Összes</Button>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <div className="font-bold">{listing.title}</div>
                  <div className="text-sm text-slate-500">{listing.city} • {formatPrice(listing.price)} • {listing.leads.length} lead</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill label={listing.isPublished ? "Publikus" : "Draft"} tone={listing.isPublished ? "green" : "amber"} />
                  <Button href={`/dashboard/listings/${listing.id}`} size="sm" variant="secondary">Nyitás</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-950 text-white">
          <h2 className="text-xl font-black">Mai AI prioritások</h2>
          <div className="mt-5 space-y-3">
            {leads[0] ? (
              <div className="rounded-2xl bg-white/10 p-4 text-sm">Hívd fel: <b>{leads[0].name}</b> — {leads[0].leadScore}/100 lead a(z) {leads[0].listing.title} ingatlannál.</div>
            ) : (
              <div className="rounded-2xl bg-white/10 p-4 text-sm">Még nincs lead. Oszd meg az első public listing oldalt.</div>
            )}
            <div className="rounded-2xl bg-white/10 p-4 text-sm">Futtasd az AI leírásgenerátort minden draft hirdetésnél.</div>
            <div className="rounded-2xl bg-white/10 p-4 text-sm">A tulajdonosi riportot hetente generáld és küldd ki.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
