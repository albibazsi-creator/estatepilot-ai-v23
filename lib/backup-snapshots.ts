import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function createMetadataBackupSnapshot(agencyId: string) {
  const [listings, leads, reports, settings] = await Promise.all([
    prisma.listing.count({ where: { agencyId } }),
    prisma.lead.count({ where: { listing: { agencyId } } }),
    prisma.sellerReport.count({ where: { listing: { agencyId } } }),
    prisma.integration.count({ where: { agencyId } })
  ]);
  const includesJson = { listings, leads, reports, settings, createdBy: "v10_metadata_snapshot" };
  const checksum = createHash("sha256").update(JSON.stringify(includesJson)).digest("hex");
  return prisma.backupSnapshot.create({ data: { agencyId, snapshotType: "metadata", status: "created", storageProvider: "local", storageKey: `metadata/${agencyId}/${Date.now()}.json`, checksum, sizeBytes: JSON.stringify(includesJson).length, includesJson, restoreNotes: "Metadata snapshot only. Media binaries remain in storage provider." } });
}
