import { guarded } from "@/lib/api-response";
import { getViewerAdapters } from "@/lib/spatial-v17";

export async function GET() {
  return guarded(async () => getViewerAdapters());
}
