import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import { CalendarSlotForm } from "@/components/dashboard/calendar-slot-form";

export default async function CalendarPage() {
  const { user, agency } = await getCurrentUser();
  const [slots, listings] = await Promise.all([
    prisma.calendarSlot.findMany({ where: { agentId: user.id }, include: { listing: true }, orderBy: { startTime: "asc" } }),
    prisma.listing.findMany({ where: { agencyId: agency.id }, select: { id: true, title: true }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Calendar / slot rendszer</h1>
        <p className="text-slate-500">Calendly-szerű alap megtekintési időpontokhoz, ICS exporttal.</p>
      </div>
      <CalendarSlotForm listings={listings} />
      <div className="grid gap-4 md:grid-cols-2">
        {slots.map((slot) => (
          <Card key={slot.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-black">{formatDate(slot.startTime)} – {formatDate(slot.endTime)}</div>
                <div className="mt-1 text-sm text-slate-500">{slot.listing?.title ?? "Általános időpont"}</div>
                {slot.note ? <div className="mt-2 text-sm text-slate-600">{slot.note}</div> : null}
              </div>
              <StatusPill label={slot.status} tone={slot.status === "OPEN" ? "green" : "amber"} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button href={`/api/calendar/slots/${slot.id}`} size="sm" variant="secondary">ICS export</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
