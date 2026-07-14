import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { buildSpatialLineageMap } from "@/lib/spatial-v19";

const Schema = z.object({ listingId: z.string().optional(), persist: z.boolean().optional() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return buildSpatialLineageMap(agency.id);
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const parsed = await parseJson(req, Schema);
    if (parsed.error) return parsed.error;
    return buildSpatialLineageMap(agency.id, parsed.data.listingId, parsed.data.persist);
  });
}
