import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ok, guarded } from "@/lib/api-response";
import { createMetadataBackupSnapshot } from "@/lib/backup-snapshots";

export async function GET() {
  return guarded(async () => {
    const { agency } = await getCurrentUser();
    const snapshots = await prisma.backupSnapshot.findMany({ where: { agencyId: agency.id }, orderBy: { createdAt: "desc" }, take: 50 });
    return { snapshots };
  });
}

export async function POST() {
  const { agency } = await getCurrentUser();
  const snapshot = await createMetadataBackupSnapshot(agency.id);
  return ok({ snapshot }, { status: 201 });
}
