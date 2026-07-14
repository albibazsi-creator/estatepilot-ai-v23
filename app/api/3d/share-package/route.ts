import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { createSpatialSharePackage } from "@/lib/spatial-v19";

const Schema = z.object({ listingId: z.string().optional(), sceneId: z.string().optional(), audience: z.string().optional(), days: z.number().int().min(1).max(90).optional(), persist: z.boolean().optional() });

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const parsed = await parseJson(req, Schema);
    if (parsed.error) return parsed.error;
    return createSpatialSharePackage(agency.id, parsed.data);
  });
}

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return createSpatialSharePackage(agency.id);
  });
}
