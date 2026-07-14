import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { buildReconstructionDispatchPayload, createV18ReconstructionRun } from "@/lib/spatial-v18";

const Schema = z.object({ listingId: z.string().optional(), createRun: z.boolean().optional() });

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return buildReconstructionDispatchPayload(agency.id);
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const parsed = await parseJson(req, Schema);
    if (parsed.error) return parsed.error;
    return parsed.data.createRun
      ? createV18ReconstructionRun(agency.id, parsed.data.listingId)
      : buildReconstructionDispatchPayload(agency.id, parsed.data.listingId);
  });
}
