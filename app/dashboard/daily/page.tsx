import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnqueueJobButton } from "@/components/dashboard/job-actions";
import { formatDate } from "@/lib/format";

export default async function DailyManagerPage() {
  const { agency, user } = await getCurrentUser();
  const [hotLeads, weakListings, staleListings, reports, tasks] = await Promise.all([
    prisma.lead.findMany({ where: { listing: { agencyId: agency.id }, leadScore: { gte: 70 } }, include: { listing: true }, orderBy: { leadScore: "desc" }, take: 10 }),
    prisma.listing.findMany({ where: { agencyId: agency.id, aiReadinessScore: { lt: 65 } }, include: { media: true, tours: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.listing.findMany({ where: { agencyId: agency.id, isPublished: true, leads: { none: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } }, take: 8 }),
    prisma.sellerReport.findMany({ where: { listing: { agencyId: agency.id }, sentAt: null }, include: { listing: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.followUpTask.findMany({ where: { assignedUserId: user.id, status: "OPEN" }, include: { lead: true, listing: true }, orderBy: [{ priority: "desc" }, { dueAt: "asc" }], take: 8 })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Napi AI manager</h1>
          <p className="mt-1 text-slate-500">Automata prioritási lista {user.name} részére.</p>
        </div>
        <EnqueueJobButton type="daily_manager" label="AI manager job indítása" priority={90} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="bg-slate-950 text-white">
          <h2 className="text-xl font-black">1. Először ezeket hívd</h2>
          <div className="mt-4 space-y-3">
            {hotLeads.map((lead) => (
              <div key={lead.id} className="rounded-2xl bg-white/10 p-4">
                <div className="font-bold">{lead.name} — {lead.leadScore}/100</div>
                <div className="text-sm text-white/70">{lead.listing.title}</div>
                <div className="mt-2 text-sm text-brand-gold">{lead.aiSummary ?? "Forró lead, gyors visszahívás javasolt."}</div>
              </div>
            ))}
            {hotLeads.length === 0 ? <p className="text-white/70">Nincs 70+ pontos lead.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">2. Listing javítások</h2>
          <div className="mt-4 space-y-3">
            {weakListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                <div>
                  <div className="font-bold">{listing.title}</div>
                  <div className="text-sm text-slate-500">Readiness: {listing.aiReadinessScore}/100 • {listing.media.length} média • {listing.tours.length} tour</div>
                </div>
                <Button href={`/dashboard/listings/${listing.id}`} size="sm" variant="secondary">Javítás</Button>
              </div>
            ))}
            {weakListings.length === 0 ? <p className="text-slate-500">Minden listing elfogadható readiness szinten van.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">3. Új kampányt igénylő hirdetések</h2>
          <div className="mt-4 space-y-3">
            {staleListings.map((listing) => (
              <div key={listing.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-bold">{listing.title}</div>
                <div className="text-sm text-slate-500">7 napja nincs új lead. Új cover, Facebook szöveg vagy Reels hook javasolt.</div>
              </div>
            ))}
            {staleListings.length === 0 ? <p className="text-slate-500">Nincs 7 napja beragadt publikált listing.</p> : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">4. Kiküldendő tulajdonosi riportok</h2>
          <div className="mt-4 space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                <div>
                  <div className="font-bold">{report.listing.title}</div>
                  <div className="text-sm text-slate-500">Generálva: {formatDate(report.createdAt)}</div>
                </div>
                <Button href={`/api/reports/${report.id}/export`} size="sm" variant="secondary">Megnyitás</Button>
              </div>
            ))}
            {reports.length === 0 ? <p className="text-slate-500">Nincs kiküldésre váró riport.</p> : null}
          </div>
        </Card>


        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">5. Konkrét follow-up taskok</h2>
            <Button href="/dashboard/follow-ups" size="sm" variant="secondary">Összes task</Button>
          </div>
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-bold">{task.title} • {task.priority}/100</div>
                <div className="mt-1 text-sm text-slate-500">{task.listing?.title ?? "–"} {task.dueAt ? `• ${formatDate(task.dueAt)}` : ""}</div>
                {task.description ? <div className="mt-2 text-sm text-slate-600">{task.description}</div> : null}
              </div>
            ))}
            {tasks.length === 0 ? <p className="text-slate-500">Nincs nyitott follow-up task.</p> : null}
          </div>
        </Card>

      </div>
    </div>
  );
}
