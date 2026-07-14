import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { createUploadIntent } from "@/lib/upload-intent";

const schema = z.object({
  listingId: z.string().optional().nullable(),
  filename: z.string().min(1),
  mimeType: z.string().min(3),
  sizeBytes: z.coerce.number().int().positive()
});

export async function POST(req: Request) {
  const { data, error } = await parseJson(req, schema);
  if (error) return error;
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return createUploadIntent({ agencyId: agency.id, listingId: data.listingId ?? undefined, filename: data.filename, mimeType: data.mimeType, sizeBytes: data.sizeBytes });
  });
}
