import { randomUUID } from "crypto";
import path from "path";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const mimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "application/pdf": ".pdf"
};

function extensionFrom(name: string, mime: string) {
  const ext = path.extname(name).toLowerCase();
  if (ext && ext.length < 12) return ext;
  return mimeToExt[mime] ?? ".bin";
}

export async function createUploadIntent(input: { agencyId?: string; listingId?: string; filename: string; mimeType: string; sizeBytes: number }) {
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  if (input.sizeBytes > maxBytes) throw new Error(`A fájl túl nagy. Maximum ${env.MAX_UPLOAD_MB} MB lehet.`);

  const key = `listings/${input.listingId ?? "unassigned"}/${Date.now()}-${randomUUID()}${extensionFrom(input.filename, input.mimeType)}`;
  const publicUrl = env.STORAGE_DRIVER === "local" ? `/uploads/${key}` : `${env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "")}/${key}`;

  const object = await prisma.uploadObject.create({
    data: {
      agencyId: input.agencyId,
      listingId: input.listingId,
      provider: env.STORAGE_DRIVER,
      storageKey: key,
      publicUrl,
      mimeType: input.mimeType,
      fileSizeBytes: input.sizeBytes,
      status: env.STORAGE_DRIVER === "local" ? "server_upload_required" : "presign_pending",
      metadataJson: { filename: input.filename }
    }
  });

  if (env.STORAGE_DRIVER === "local") {
    return {
      uploadObjectId: object.id,
      mode: "server_form_upload",
      provider: "local",
      storageKey: key,
      publicUrl,
      uploadEndpoint: input.listingId ? `/api/listings/${input.listingId}/media/upload` : "/api/uploads/local",
      headers: {}
    };
  }

  return {
    uploadObjectId: object.id,
    mode: "presigned_upload_not_enabled_in_starter",
    provider: env.STORAGE_DRIVER,
    storageKey: key,
    publicUrl,
    uploadEndpoint: null,
    headers: {},
    nextAction: "Telepíts AWS SDK-t vagy Cloudflare R2 SDK-t, majd itt add vissza a valódi presigned PUT URL-t. Az adatmodell készen áll."
  };
}
