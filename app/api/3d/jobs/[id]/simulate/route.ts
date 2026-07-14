import { guarded } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/current-user";
import { simulateSpatialJobCompletion } from "@/lib/spatial-v17";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return guarded(async () => {
    const { id } = await params;
    const { agency } = await getCurrentUser();
    if (process.env.ENABLE_SPATIAL_WORKER_SIMULATION === "false") throw new Error("Spatial worker simulation is disabled");
    return simulateSpatialJobCompletion(agency.id, id);
  });
}
