import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/current-user";

function createFollowUpDraft(lead: any) {
  if (!lead) return null;
  const listingTitle = lead.listing?.title ?? "az ingatlan";
  const hasAppointment = lead.appointments.length > 0;

  if (hasAppointment) {
    return {
      channel: lead.email ? "email" : "phone",
      subject: `Megtekintés után – ${listingTitle}`,
      body: `Szia ${lead.name}!\n\nKöszönöm, hogy érdeklődtél a(z) ${listingTitle} iránt. A megtekintés után szívesen válaszolok minden további kérdésedre, illetve ha komolyan érdekel az ingatlan, egyeztethetünk a következő lépésekről is.\n\nÜdv,\nEstatePilot AI demo`
    };
  }

  if (lead.leadScore >= 81) {
    return {
      channel: lead.phone ? "phone" : "email",
      subject: `Gyors egyeztetés – ${listingTitle}`,
      body: `Szia ${lead.name}!\n\nLáttam, hogy komolyabban érdeklődtél a(z) ${listingTitle} iránt. Érdemes lenne röviden egyeztetnünk, mert tudok segíteni megtekintési időponttal és a részletek pontosításával.\n\nMikor lenne jó, ha felhívnálak?`
    };
  }

  return {
    channel: lead.email ? "email" : "phone",
    subject: `Kérdésed van? – ${listingTitle}`,
    body: `Szia ${lead.name}!\n\nKöszönöm az érdeklődést a(z) ${listingTitle} iránt. Ha szeretnél több képet, alaprajzot, 360 bejárást vagy személyes időpontot, szívesen segítek.\n\nÜdv,\nEstatePilot AI demo`
  };
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, include: { listing: true, events: true, appointments: true } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const draft = createFollowUpDraft(lead);
  await prisma.leadEvent.create({ data: { leadId: lead.id, listingId: lead.listingId, eventType: "follow_up_draft_generated", metadataJson: draft ?? undefined } });
  await audit("follow_up_draft_generated", "Lead", lead.id, { draft }, user.id);

  return NextResponse.json({ draft });
}
