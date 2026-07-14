import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { guarded } from "@/lib/api-response";
import { buildLeadOfferDraft } from "@/lib/offer";
import { audit } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { id } = await params;
    const { user, agency } = await requireRole("AGENT");
    const lead = await prisma.lead.findFirst({ where: { id, listing: { agencyId: agency.id } }, include: { listing: true } });
    if (!lead) throw new Error("Lead not found");
    const draft = buildLeadOfferDraft(lead, lead.listing);
    const task = await prisma.followUpTask.create({
      data: {
        listingId: lead.listingId,
        leadId: lead.id,
        assignedUserId: user.id,
        title: `Ajánlat follow-up: ${lead.name}`,
        description: draft.recommendedAction,
        priority: lead.leadScore,
        dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    });
    await audit("offer_draft_created", "Lead", id, { taskId: task.id, leadScore: lead.leadScore }, user.id);
    return { draft, taskId: task.id };
  });
}
