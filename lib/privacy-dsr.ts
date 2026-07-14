import { prisma } from "@/lib/prisma";

export async function createDataSubjectRequest(input: { agencyId?: string | null; requesterEmail: string; requesterName?: string | null; requestType: string; notes?: string | null }) {
  const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return prisma.dataSubjectRequest.create({
    data: {
      agencyId: input.agencyId ?? null,
      requesterEmail: input.requesterEmail.toLowerCase(),
      requesterName: input.requesterName ?? null,
      requestType: input.requestType,
      notes: input.notes ?? null,
      dueAt
    }
  });
}

export async function buildPrivacyExport(agencyId: string, email: string) {
  const normalized = email.toLowerCase();
  const [leads, consents, appointments, feedback] = await Promise.all([
    prisma.lead.findMany({ where: { email: normalized, listing: { agencyId } }, include: { listing: { select: { title: true, slug: true } } } }),
    prisma.consentRecord.findMany({ where: { subjectEmail: normalized, agencyId }, orderBy: { createdAt: "desc" } }),
    prisma.appointment.findMany({ where: { lead: { email: normalized, listing: { agencyId } } }, include: { listing: { select: { title: true } } } }),
    prisma.productFeedback.findMany({ where: { agencyId, userEmail: normalized }, orderBy: { createdAt: "desc" } })
  ]);
  return { email: normalized, generatedAt: new Date().toISOString(), leads, consents, appointments, feedback };
}

export async function completeDataSubjectExport(requestId: string, agencyId: string) {
  const request = await prisma.dataSubjectRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("DSR request not found");
  const exportJson = await buildPrivacyExport(agencyId, request.requesterEmail);
  return prisma.dataSubjectRequest.update({
    where: { id: requestId },
    data: { status: "completed", verificationStatus: "verified", exportJson, completedAt: new Date() }
  });
}

export async function markDeletionPlanned(requestId: string, notes?: string) {
  return prisma.dataSubjectRequest.update({
    where: { id: requestId },
    data: { status: "deletion_review", redactionJson: { planned: true, notes: notes ?? "Manual review required before anonymization." } }
  });
}
