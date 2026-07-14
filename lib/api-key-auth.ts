import { prisma } from "@/lib/prisma";
import { apiKeyPrefix, secureCompareHash } from "@/lib/api-keys";

export async function requireApiKey(req: Request, requiredScope: string) {
  const header = req.headers.get("authorization") ?? req.headers.get("x-api-key") ?? "";
  const rawKey = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : header.trim();
  if (!rawKey) throw new Error("Missing API key");

  const prefix = apiKeyPrefix(rawKey);
  const candidates = await prisma.apiKey.findMany({ where: { prefix, revokedAt: null }, include: { agency: true } });
  const apiKey = candidates.find((candidate) => secureCompareHash(rawKey, candidate.keyHash));
  if (!apiKey) throw new Error("Invalid API key");
  if (!apiKey.scopes.includes(requiredScope) && !apiKey.scopes.includes("*") && !apiKey.scopes.includes(`${requiredScope.split(":")[0]}:*`)) {
    throw new Error(`Forbidden: missing scope ${requiredScope}`);
  }

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  return { apiKey, agency: apiKey.agency };
}
