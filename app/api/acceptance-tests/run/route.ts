import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { runAcceptanceSuite } from "@/lib/acceptance-tests";

export async function POST() {
  return guarded(async () => {
    const { agency, user } = await getCurrentUser();
    return runAcceptanceSuite(agency.id, user.email);
  });
}
