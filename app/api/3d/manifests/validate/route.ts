import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { validateSceneManifestStrict } from "@/lib/spatial-v18";

const Schema = z.object({
  listingId: z.string().optional(),
  manifest: z.object({}).passthrough().optional()
});

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return validateSceneManifestStrict(agency.id);
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const parsed = await parseJson(req, Schema);
    if (parsed.error) return parsed.error;
    return validateSceneManifestStrict(agency.id, parsed.data.manifest, parsed.data.listingId);
  });
}
