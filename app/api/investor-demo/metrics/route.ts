import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getInvestorDemoPack } from "@/lib/investor-demo";

export async function GET() { return guarded(async () => { const { agency } = await getCurrentUser(); return getInvestorDemoPack(agency.id); }); }
