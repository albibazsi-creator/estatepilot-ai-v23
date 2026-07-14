import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { createCheckout } from "@/lib/billing";

const schema = z.object({
  planCode: z.string().min(2),
  listingId: z.string().optional().nullable(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

export async function POST(req: Request) {
  const { data, error } = await parseJson(req, schema);
  if (error) return error;
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    return createCheckout({ agencyId: agency.id, planCode: data.planCode, listingId: data.listingId, successUrl: data.successUrl, cancelUrl: data.cancelUrl });
  });
}
