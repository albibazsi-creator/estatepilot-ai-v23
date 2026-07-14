import { prisma } from "@/lib/prisma";

export async function audit(action: string, entityType: string, entityId?: string, metadata?: unknown, actorUserId?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        actorUserId,
        metadata: metadata as object | undefined
      }
    });
  } catch (error) {
    console.error("Audit log failed", error);
  }
}
