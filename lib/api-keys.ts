import { createHash, randomBytes, timingSafeEqual } from "crypto";

const PREFIX = "ep_live";

export function createPlainApiKey() {
  const secret = randomBytes(24).toString("base64url");
  return `${PREFIX}_${secret}`;
}

export function apiKeyPrefix(key: string) {
  const parts = key.split("_");
  if (parts.length < 3) return key.slice(0, 12);
  return `${parts[0]}_${parts[1]}_${parts[2].slice(0, 6)}`;
}

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function secureCompareHash(rawKey: string, storedHash: string) {
  const rawHash = hashApiKey(rawKey);
  const a = Buffer.from(rawHash);
  const b = Buffer.from(storedHash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function redactApiKey(key: string) {
  if (key.length <= 12) return "••••";
  return `${key.slice(0, 10)}••••${key.slice(-4)}`;
}
