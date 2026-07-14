import { prisma } from "@/lib/prisma";

export async function isFeatureEnabled(key: string, agencyId?: string | null) {
  const flag = await prisma.featureFlag.findFirst({
    where: {
      key,
      OR: [{ agencyId: agencyId ?? undefined }, { agencyId: null }]
    },
    orderBy: [{ agencyId: "desc" }, { updatedAt: "desc" }]
  });
  return Boolean(flag?.enabled);
}

export async function upsertFeatureFlag(input: { agencyId?: string | null; key: string; enabled: boolean; description?: string | null; rolloutJson?: Record<string, unknown> | null }) {
  return prisma.featureFlag.upsert({
    where: { agencyId_key: { agencyId: input.agencyId ?? null, key: input.key } },
    update: { enabled: input.enabled, description: input.description ?? null, rolloutJson: input.rolloutJson ?? undefined },
    create: { agencyId: input.agencyId ?? null, key: input.key, enabled: input.enabled, description: input.description ?? null, rolloutJson: input.rolloutJson ?? undefined }
  });
}
