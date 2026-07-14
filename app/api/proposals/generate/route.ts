import { z } from "zod";
import { getCurrentUser } from "@/lib/current-user";
import { guarded, parseJson } from "@/lib/api-response";
import { generateProposalDraft } from "@/lib/proposals";

const schema = z.object({ listingId: z.string().optional(), leadId: z.string().optional(), dealId: z.string().optional() });

export async function POST(req: Request) {
  return guarded(async () => {
    const { agency, user } = await getCurrentUser();
    const { data, error } = await parseJson(req, schema);
    if (error) return error;
    return generateProposalDraft({ agencyId: agency.id, generatedById: user.id, ...data });
  });
}
