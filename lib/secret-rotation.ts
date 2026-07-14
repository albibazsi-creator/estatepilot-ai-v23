import { prisma } from "@/lib/prisma";
import { providerDefinitions } from "@/lib/provider-health";

export async function ensureSecretRotationItems(agencyId?: string | null) {
  const secrets = providerDefinitions.flatMap((p) => p.requiredEnv.map((secretName) => ({ provider: p.provider, secretName })));
  const rows = [];
  for (const secret of secrets) {
    rows.push(await prisma.secretRotationItem.upsert({
      where: { agencyId_provider_secretName: { agencyId: agencyId ?? null, provider: secret.provider, secretName: secret.secretName } },
      create: {
        agencyId: agencyId ?? null,
        provider: secret.provider,
        secretName: secret.secretName,
        status: process.env[secret.secretName] ? "configured" : "not_configured",
        rotationDays: 90,
        nextDueAt: process.env[secret.secretName] ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : null
      },
      update: { status: process.env[secret.secretName] ? "configured" : "not_configured" }
    }));
  }
  return rows;
}

export async function getSecretRotationSummary(agencyId?: string | null) {
  const items = await ensureSecretRotationItems(agencyId);
  const configured = items.filter((i) => i.status === "configured").length;
  const overdue = items.filter((i) => i.nextDueAt && i.nextDueAt < new Date()).length;
  const score = Math.round((configured * 100 - overdue * 25) / Math.max(1, items.length));
  return { items, configured, overdue, total: items.length, score: Math.max(0, score) };
}
