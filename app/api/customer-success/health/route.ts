import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ok, guarded } from "@/lib/api-response";
import { calculateAgencyHealth } from "@/lib/customer-success";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const latest = await prisma.customerSuccessHealth.findFirst({ where: { agencyId: agency.id }, orderBy: { calculatedAt: "desc" } });
    return { latest };
  });
}

export async function POST() {
  const { agency } = await getCurrentUser();
  const health = await calculateAgencyHealth(agency.id);
  return ok({ health }, { status: 201 });
}
