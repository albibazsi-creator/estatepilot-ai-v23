import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { buildSpatialProductionOrchestration, createSpatialProductionOrchestrationRun } from "@/lib/spatial-v19";

const Schema = z.object({ listingId: z.string().optional(), createRun: z.boolean().optional() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return buildSpatialProductionOrchestration(agency.id);
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const parsed = await parseJson(req, Schema);
    if (parsed.error) return parsed.error;
    return parsed.data.createRun ? createSpatialProductionOrchestrationRun(agency.id, parsed.data.listingId) : buildSpatialProductionOrchestration(agency.id, parsed.data.listingId);
  });
}
