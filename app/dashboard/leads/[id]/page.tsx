import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadActions } from "@/components/dashboard/lead-actions";
import { StatusPill } from "@/components/status-pill";
import { formatDate, formatPrice } from "@/lib/format";

function scoreTone(score: number) {
  if (score >= 81) return "red" as const;
  if (score >= 61) return "amber" as const;
  if (score >= 31) return "green" as const;
  return "slate" as const;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      listing: true,
      events: { orderBy: { createdAt: "desc" }, take: 50 },
      appointments: { orderBy: { startTime: "asc" } }
    }
  });

  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{lead.name}</h1>
          <p className="text-slate-500">{lead.listing.title}</p>
        </div>
        <div className="flex gap-2">
          <Button href="/dashboard/leads" variant="secondary">Vissza</Button>
          <StatusPill label={`${lead.leadScore}/100`} tone={scoreTone(lead.leadScore)} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="text-xl font-black">Kontakt</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><b>Email:</b> {lead.email ?? "nincs megadva"}</p>
              <p><b>Telefon:</b> {lead.phone ?? "nincs megadva"}</p>
              <p><b>Státusz:</b> {lead.status}</p>
              <p><b>Forrás:</b> {lead.source}</p>
              <p><b>Létrejött:</b> {formatDate(lead.createdAt)}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black">Lead szándék</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p><b>Cél:</b> {lead.buyingIntent ?? "nincs adat"}</p>
              <p><b>Finanszírozás:</b> {lead.financingType ?? "nincs adat"}</p>
              <p><b>Költözési idő:</b> {lead.moveTimeline ?? "nincs adat"}</p>
            </div>
            {lead.message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{lead.message}</p> : null}
          </Card>

          <LeadActions leadId={lead.id} currentStatus={lead.status} />
        </div>

        <div className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Kapcsolódó ingatlan</h2>
                <p className="mt-1 text-sm text-slate-500">{lead.listing.city}{lead.listing.district ? `, ${lead.listing.district}` : ""}</p>
              </div>
              <Button href={`/dashboard/listings/${lead.listing.id}`} variant="secondary" size="sm">Megnyitás</Button>
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <Mini label="Ár" value={formatPrice(lead.listing.price)} />
              <Mini label="Méret" value={`${lead.listing.sizeM2 ?? "–"} m²`} />
              <Mini label="Szobák" value={`${lead.listing.rooms ?? "–"}`} />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black">Időpontok</h2>
            <div className="mt-4 space-y-3">
              {lead.appointments.length ? lead.appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="font-bold">{new Date(appointment.startTime).toLocaleString("hu-HU")}</div>
                  <div className="text-slate-500">{appointment.status}</div>
                </div>
              )) : <p className="text-sm text-slate-500">Még nincs időpontfoglalás.</p>}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-black">Aktivitási timeline</h2>
            <div className="mt-4 space-y-3">
              {lead.events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-100 p-4 text-sm">
                  <div className="font-bold">{event.eventType}</div>
                  <div className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString("hu-HU")}</div>
                  {event.metadataJson ? <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-2 text-xs">{JSON.stringify(event.metadataJson, null, 2)}</pre> : null}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-black">{value}</div>
    </div>
  );
}
