import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

function tone(score: number) {
  if (score >= 81) return "red" as const;
  if (score >= 61) return "amber" as const;
  if (score >= 31) return "green" as const;
  return "slate" as const;
}

export default async function LeadsPage() {
  const { user } = await getCurrentUser();
  const leads = await prisma.lead.findMany({
    where: { agentId: user.id },
    include: { listing: true, events: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }]
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Lead dashboard</h1>
        <p className="text-slate-500">0–100 scoring, forrósági kategória, aktivitás.</p>
      </div>
      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xl font-black">{lead.name}</div>
                <div className="mt-1 text-sm text-slate-500">{lead.phone ?? "nincs telefon"} • {lead.email ?? "nincs email"}</div>
                <div className="mt-2 text-sm text-slate-500">Ingatlan: {lead.listing.title}</div>
                <div className="mt-3"><Button href={`/dashboard/leads/${lead.id}`} size="sm" variant="secondary">Részletek</Button></div>
              </div>
              <StatusPill label={`${lead.leadScore}/100`} tone={tone(lead.leadScore)} />
            </div>
            {lead.message ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{lead.message}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>Létrejött: {formatDate(lead.createdAt)}</span>
              {lead.events.map((e) => <span key={e.id} className="rounded-full bg-slate-100 px-2 py-1">{e.eventType}</span>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
