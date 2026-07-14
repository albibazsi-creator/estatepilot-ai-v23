import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";

function tone(status: string) {
  if (status === "CONFIRMED") return "green" as const;
  if (status === "CANCELLED") return "red" as const;
  if (status === "COMPLETED") return "slate" as const;
  return "amber" as const;
}

export default async function AppointmentsPage() {
  const { user } = await getCurrentUser();
  const appointments = await prisma.appointment.findMany({
    where: { agentId: user.id },
    include: { lead: true, listing: true },
    orderBy: { startTime: "asc" }
  });

  const upcoming = appointments.filter((a) => a.startTime >= new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Időpontfoglalások</h1>
        <p className="text-slate-500">Public lead booking + belső appointment dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><div className="text-sm text-slate-500">Összes</div><div className="mt-2 text-3xl font-black">{appointments.length}</div></Card>
        <Card><div className="text-sm text-slate-500">Közelgő</div><div className="mt-2 text-3xl font-black">{upcoming.length}</div></Card>
        <Card><div className="text-sm text-slate-500">Megerősített</div><div className="mt-2 text-3xl font-black">{appointments.filter((a) => a.status === "CONFIRMED").length}</div></Card>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xl font-black">{appointment.lead.name}</div>
                <div className="mt-1 text-sm text-slate-500">{appointment.listing.title}</div>
                <div className="mt-2 text-sm font-semibold">{appointment.startTime.toLocaleString("hu-HU")} – {appointment.endTime.toLocaleTimeString("hu-HU")}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill label={appointment.status} tone={tone(appointment.status)} />
                <Button href={`/dashboard/leads/${appointment.lead.id}`} size="sm" variant="secondary">Lead</Button>
              </div>
            </div>
          </Card>
        ))}
        {!appointments.length ? <Card><p className="text-slate-500">Még nincs időpontfoglalás.</p></Card> : null}
      </div>
    </div>
  );
}
