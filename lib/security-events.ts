import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/consent";

export async function securityEvent(input: {
  agencyId?: string | null;
  actorUserId?: string | null;
  eventType: string;
  severity?: "info" | "warning" | "critical";
  ip?: string | null;
  userAgent?: string | null;
  metadataJson?: Record<string, unknown> | null;
}) {
  return prisma.securityEvent.create({
    data: {
      agencyId: input.agencyId ?? null,
      actorUserId: input.actorUserId ?? null,
      eventType: input.eventType,
      severity: input.severity ?? "info",
      ipHash: hashIp(input.ip),
      userAgent: input.userAgent?.slice(0, 300) ?? null,
      metadataJson: input.metadataJson ?? undefined
    }
  });
}
