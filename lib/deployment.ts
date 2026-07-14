import { prisma } from "@/lib/prisma";

const defaults = [
  { name: "local", status: "ready", url: "http://localhost:3000", branch: "dev", gatesJson: ["db_seed", "smoke", "acceptance"] },
  { name: "staging", status: "planned", url: "https://staging.estatepilot.ai", branch: "main", gatesJson: ["env_doctor", "provider_health", "acceptance", "domain_ssl"] },
  { name: "production", status: "blocked", url: "https://app.estatepilot.ai", branch: "release", gatesJson: ["auth_live", "storage_live", "billing_live", "monitoring_live", "legal_pages"] }
];

export async function ensureDeploymentEnvironments(agencyId?: string | null) {
  const rows = [];
  for (const item of defaults) {
    rows.push(await prisma.deploymentEnvironment.upsert({
      where: { agencyId_name: { agencyId: agencyId ?? null, name: item.name } },
      create: { agencyId: agencyId ?? null, ...item, requiredEnvJson: [] },
      update: {}
    }));
  }
  return rows;
}

export async function getDeploymentReadiness(agencyId?: string | null) {
  const environments = await ensureDeploymentEnvironments(agencyId);
  const ready = environments.filter((e) => e.status === "ready").length;
  const blocked = environments.filter((e) => e.status === "blocked").length;
  const score = Math.round((ready * 100 + (environments.length - ready - blocked) * 45) / Math.max(1, environments.length));
  return { environments, ready, blocked, score };
}
