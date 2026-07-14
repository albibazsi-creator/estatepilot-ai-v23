import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { getDigitalTwinReadiness, runDigitalTwinReadinessAudit } from "@/lib/spatial-3d";

const schema = z.object({ listingId: z.string().optional() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return getDigitalTwinReadiness(agency.id);
  });
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return runDigitalTwinReadinessAudit(agency.id, parsed.data.listingId);
  });
}
