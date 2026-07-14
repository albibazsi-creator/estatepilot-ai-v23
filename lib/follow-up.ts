import type { Lead, LeadEvent, Listing } from "@prisma/client";

type LeadWithContext = Lead & { listing?: Listing; events?: LeadEvent[] };

export function buildFollowUpTasksForLead(lead: LeadWithContext) {
  const due = new Date();
  const tasks = [] as Array<{ title: string; description: string; priority: number; dueAt: Date }>;
  const contact = lead.phone || lead.email || "nincs megadott kontakt";

  if (lead.leadScore >= 81) {
    const fastDue = new Date(due.getTime() + 2 * 60 * 60 * 1000);
    tasks.push({
      title: `Forró lead visszahívása: ${lead.name}`,
      description: `${lead.leadScore}/100 pont. Kontakt: ${contact}. Üzenet: ${lead.message ?? "nincs"}`,
      priority: 95,
      dueAt: fastDue
    });
  } else if (lead.leadScore >= 61) {
    const dayDue = new Date(due.getTime() + 24 * 60 * 60 * 1000);
    tasks.push({
      title: `Meleg lead utánkövetés: ${lead.name}`,
      description: `Küldj neki megtekintési időpontokat vagy kérdezz rá a finanszírozásra. Kontakt: ${contact}.`,
      priority: 75,
      dueAt: dayDue
    });
  } else {
    const laterDue = new Date(due.getTime() + 72 * 60 * 60 * 1000);
    tasks.push({
      title: `Lead nurture: ${lead.name}`,
      description: `Küldj rövid összefoglalót és public listing linket. Kontakt: ${contact}.`,
      priority: 45,
      dueAt: laterDue
    });
  }

  if (!lead.phone && lead.email) {
    tasks.push({
      title: `Telefonszám bekérése: ${lead.name}`,
      description: "A lead emailt megadott, de telefonszámot nem. Kérj gyors kontaktot a megtekintéshez.",
      priority: 60,
      dueAt: new Date(due.getTime() + 24 * 60 * 60 * 1000)
    });
  }

  return tasks;
}
