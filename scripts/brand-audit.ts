import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const agencies = await prisma.agency.count();
  const profiles = await prisma.agencyBrandingProfile.count();
  const domains = await prisma.whiteLabelDomain.count();
  const translations = await prisma.listingTranslation.count();
  console.log(JSON.stringify({ ok: profiles > 0 || agencies === 0, agencies, brandProfiles: profiles, whiteLabelDomains: domains, translations }, null, 2));
}

main().finally(async () => prisma.$disconnect());
