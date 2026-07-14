import { z } from "zod";
import { guarded, parseJson } from "@/lib/api-response";
import { answerListingQuestion } from "@/lib/safe-chat";

const schema = z.object({ listingId: z.string(), question: z.string().min(2) });

export async function POST(req: Request) {
  return guarded(async () => {
    const { data, error } = await parseJson(req, schema);
    if (error) return error;
    return answerListingQuestion(data.listingId, data.question);
  });
}
