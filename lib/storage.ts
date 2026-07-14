import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";

export type UploadInput = {
  listingId: string;
  file: File;
};

export type StoredObject = {
  publicUrl: string;
  storageProvider: string;
  storageKey: string;
  fileSizeBytes: number;
  mimeType: string;
};

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "application/pdf"
]);

export function assertAllowedUpload(file: File) {
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`A fájl túl nagy. Maximum ${env.MAX_UPLOAD_MB} MB lehet.`);
  }
  if (!allowedTypes.has(file.type)) {
    throw new Error(`Nem támogatott fájltípus: ${file.type || "ismeretlen"}`);
  }
}

export function inferMediaType(mime: string, fallback?: string | null) {
  if (fallback && ["IMAGE", "VIDEO", "PANORAMA_360", "FLOORPLAN"].includes(fallback)) return fallback;
  if (mime === "application/pdf") return "FLOORPLAN";
  if (mime.startsWith("video/")) return "VIDEO";
  return "IMAGE";
}

function safeExtension(filename: string, mime: string) {
  const ext = path.extname(filename).toLowerCase();
  if (ext && ext.length <= 8) return ext;
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "application/pdf") return ".pdf";
  return ".bin";
}

export async function storeUpload({ listingId, file }: UploadInput): Promise<StoredObject> {
  assertAllowedUpload(file);

  if (env.STORAGE_DRIVER !== "local") {
    // Production hook: swap this for AWS SDK / R2 presigned upload after installing the SDK.
    // The rest of the app already stores provider/key/URL, so the database layer is ready.
    throw new Error(`${env.STORAGE_DRIVER} storage is configured but the SDK adapter is not installed in this starter.`);
  }

  const key = `listings/${listingId}/${Date.now()}-${randomUUID()}${safeExtension(file.name, file.type)}`;
  const absolutePath = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return {
    publicUrl: `/uploads/${key}`,
    storageProvider: "local",
    storageKey: key,
    fileSizeBytes: file.size,
    mimeType: file.type
  };
}
