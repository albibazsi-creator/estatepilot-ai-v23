import { guarded } from "@/lib/api-response";
import { getGpuWorkerDeploymentPlan } from "@/lib/spatial-v18";

export async function GET() {
  return guarded(async () => getGpuWorkerDeploymentPlan());
}
