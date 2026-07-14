import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function ensureDemoSandboxSnapshot(agencyId: string) {
  const snapshot = await prisma.demoSandboxSnapshot.findFirst({ where: { agencyId, name: "Default sales demo snapshot" } });
  if (snapshot) return snapshot;
  return prisma.demoSandboxSnapshot.create({ data: { agencyId, name: "Default sales demo snapshot", status: "ready", resetToken: randomUUID(), includesJson: { listings: 3, leads: 1, reports: 1, campaigns: true, governance: true } } });
}

export async function createSandboxResetPlan(agencyId: string) {
  const snapshot = await ensureDemoSandboxSnapshot(agencyId);
  return { snapshot, resetEnabled: process.env.V11_PUBLIC_DEMO_RESET_ENABLED === "true", steps: ["Export audit bundle", "Re-seed demo data", "Rebuild route inventory", "Run release:v11-check"], warning: "Demo reset is intentionally disabled by default for safety." };
}
