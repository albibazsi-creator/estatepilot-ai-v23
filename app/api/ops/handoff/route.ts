import { getCurrentUser } from "@/lib/current-user";
import { guarded } from "@/lib/api-response";
import { calculateHandoffScore } from "@/lib/handoff";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return calculateHandoffScore(agency.id);
  });
}
