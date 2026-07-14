import { getGpuWorkerDeploymentPlan } from "../lib/spatial-v18";
const plan = getGpuWorkerDeploymentPlan();
console.log(JSON.stringify({ check: "gpu-worker-deployment", score: plan.score, status: plan.status, missingEnv: plan.missingEnv }, null, 2));
if (plan.score < 20) process.exitCode = 1;
