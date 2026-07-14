import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const agency = await prisma.agency.findFirst({ include: { listings: true, members: true } });
  if (!agency) throw new Error("No agency found. Run npm run db:seed first.");
  if (agency.listings.length === 0) throw new Error("No listings found.");

  const [leads, campaigns, tasks, slots, payments, uploads, calendarConnections, portalExports, qualityIssues, consents, featureFlags, securityEvents] = await Promise.all([
    prisma.lead.count({ where: { listing: { agencyId: agency.id } } }),
    prisma.marketingCampaign.count({ where: { agencyId: agency.id } }),
    prisma.followUpTask.count({ where: { listing: { agencyId: agency.id } } }),
    prisma.calendarSlot.count({ where: { agent: { agencyMembers: { some: { agencyId: agency.id } } } } }),
    prisma.paymentRecord.count({ where: { agencyId: agency.id } }),
    prisma.uploadObject.count({ where: { agencyId: agency.id } }),
    prisma.calendarConnection.count({ where: { agencyId: agency.id } }),
    prisma.portalExport.count({ where: { agencyId: agency.id } }),
    prisma.dataQualityIssue.count({ where: { agencyId: agency.id } }),
    prisma.consentRecord.count({ where: { agencyId: agency.id } }),
    prisma.featureFlag.count({ where: { agencyId: agency.id } }),
    prisma.securityEvent.count({ where: { agencyId: agency.id } })
  ]);

  console.log(JSON.stringify({
    ok: true,
    agency: agency.name,
    members: agency.members.length,
    listings: agency.listings.length,
    leads,
    campaigns,
    followUpTasks: tasks,
    calendarSlots: slots,
    payments,
    uploads,
    calendarConnections,
    portalExports,
    qualityIssues,
    consents,
    featureFlags,
    securityEvents
  }, null, 2));
}

main().finally(async () => prisma.$disconnect());
